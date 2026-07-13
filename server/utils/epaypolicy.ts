// ePayPolicy (epay3) API client. Basic auth with API key + secret.
// Sandbox: https://api-sandbox.epaypolicy.com — Production: https://api.epaypolicy.com

const BASE_URL = () => (process.env.EPAYPOLICY_API_URL || 'https://api.epaypolicy.com').replace(/\/$/, '')

export function epayConfigured(): boolean {
  return !!process.env.EPAYPOLICY_API_KEY
}

function authHeader(): string {
  const key = process.env.EPAYPOLICY_API_KEY || ''
  const secret = process.env.EPAYPOLICY_API_SECRET || ''
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
}

export async function epayFetch(path: string, options: { method?: string; body?: any; query?: Record<string, string> } = {}) {
  let url = `${BASE_URL()}${path}`
  if (options.query) {
    url += `?${new URLSearchParams(options.query).toString()}`
  }

  const headers: Record<string, string> = {
    Authorization: authHeader(),
    'Content-Type': 'application/json',
  }
  if (process.env.EPAYPOLICY_IMPERSONATION_KEY) {
    headers.impersonationAccountKey = process.env.EPAYPOLICY_IMPERSONATION_KEY
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  return { ok: res.ok, status: res.status, data }
}
