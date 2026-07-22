import jwt from 'jsonwebtoken'
import prisma from '~/server/database/client'
import { commissionableBreakdown } from '~/utils/enrollmentFee'

// Appends payment rows to a Google Sheet on each payment. Configured entirely
// via env; if unconfigured it no-ops (so payments never fail on this account).
//
// Required env:
//   GOOGLE_SHEETS_SPREADSHEET_ID   - the target spreadsheet id (from its URL)
//   GOOGLE_SERVICE_ACCOUNT_EMAIL   - service account email (…@…iam.gserviceaccount.com)
//   GOOGLE_PRIVATE_KEY             - the service account private key (PEM; \n escaped is fine)
// Optional:
//   GOOGLE_SHEETS_PAYMENTS_TAB     - worksheet/tab name (default "Payments")
//
// Share the spreadsheet with the service account email (Editor) so it can write.

function sheetsConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  const tab = process.env.GOOGLE_SHEETS_PAYMENTS_TAB || 'Payments'
  if (!spreadsheetId || !clientEmail || !privateKey) return null
  return { spreadsheetId, clientEmail, privateKey, tab }
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const assertion = jwt.sign(
    {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    privateKey,
    { algorithm: 'RS256' },
  )
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const data: any = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(`Google token exchange failed: ${res.status} ${JSON.stringify(data)}`)
  }
  return data.access_token
}

async function appendRow(values: (string | number)[]) {
  const cfg = sheetsConfig()
  if (!cfg) {
    console.warn('[googleSheets] not configured — skipping payment log (set GOOGLE_SHEETS_* env vars)')
    return { logged: false, reason: 'not_configured' }
  }
  const token = await getAccessToken(cfg.clientEmail, cfg.privateKey)
  const range = `${cfg.tab}!A1`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [values] }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google Sheets append failed: ${res.status} ${text}`)
  }
  return { logged: true }
}

function monthlyPremium(app: any): number {
  let total = 0
  if (app.healthPlanPrice != null) total += app.healthPlanPrice
  if (app.visionAndDentalPlan && app.visionAndDentalPrice != null) total += app.visionAndDentalPrice
  for (const plan of app.ancillaryPlans || []) if (plan.price != null) total += plan.price
  return Number(total.toFixed(2))
}

// Column order (set these headers in row 1 of your sheet):
// Timestamp | Invoice | Application ID | Enrollee | Email | Agent | Manager |
// Company | Type | Plan | Monthly Premium | Plan Commissionable |
// Dental/Vision Commissionable | Ancillary Commissionable | Commissionable Total |
// Amount Charged | Method | Status | Transaction ID
export async function logPaymentToSheet(
  app: any,
  payment: { amount: number; method: string; status: string; transactionId?: string | null; invoice: string },
) {
  try {
    // Resolve the agent + upline + company from the enrollee's company.
    let agentName = ''
    let managerName = ''
    let companyName = ''
    let enrollmentType = ''
    const companyId = app.user?.companyId
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          companyName: true,
          enrollmentType: true,
          agent: {
            select: {
              firstName: true,
              lastName: true,
              agentAdmin: { select: { firstName: true, lastName: true } },
            },
          },
        },
      })
      companyName = company?.companyName || ''
      enrollmentType = company?.enrollmentType || ''
      if (company?.agent) {
        agentName = [company.agent.firstName, company.agent.lastName].filter(Boolean).join(' ')
        if (company.agent.agentAdmin) {
          managerName = [company.agent.agentAdmin.firstName, company.agent.agentAdmin.lastName].filter(Boolean).join(' ')
        }
      }
    }

    const enrolleeName = [app.firstName, app.lastName].filter(Boolean).join(' ') || '—'

    // Family = an individual enrollment that also covers a spouse and/or dependents.
    const hasFamily = !!(app.spouseFirstName || app.spouseLastName || (app.dependents?.length ?? 0) > 0)
    const typeLabel =
      enrollmentType === 'group' ? 'Group'
      : enrollmentType === 'custom' ? 'Custom Group'
      : hasFamily ? 'Family'
      : 'Individual'

    // Company column: the company name for group/custom; the person's name for
    // individual/family (there's no real company for a household).
    const companyOrName =
      enrollmentType === 'group' || enrollmentType === 'custom'
        ? companyName || enrolleeName
        : enrolleeName

    const premium = monthlyPremium(app)
    const comm = commissionableBreakdown(app)
    const row = [
      new Date().toISOString(),
      payment.invoice,
      app.id,
      enrolleeName,
      app.email || app.user?.email || '',
      agentName,
      managerName,
      companyOrName,
      typeLabel,
      app.healthPlan || '',
      premium,
      comm.plan,
      comm.dentalVision,
      comm.ancillary,
      comm.total,
      payment.amount,
      payment.method,
      payment.status,
      payment.transactionId || '',
    ]
    return await appendRow(row)
  } catch (err) {
    console.error('[googleSheets] failed to log payment:', err)
    return { logged: false, reason: 'error' }
  }
}
