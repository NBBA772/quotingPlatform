// One-time enrollment fee added to the first payment unless waived
// (InsuranceApplication.waiveOneTimeFee). Shared by the plan page,
// payment endpoints, and PDF generators.
export const ONE_TIME_ENROLLMENT_FEE = 99.95

// Per-PRODUCT fee removed from each plan's monthly price to get its
// commissionable amount: commissionable = product price − this fee (min 0).
// Applied to every product line — health/custom plan, dental & vision, and
// each ancillary — then summed. Covers individual, group, and custom enrollees
// (a custom company's chosen plan is stored in healthPlan/healthPlanPrice).
export const COMMISSIONABLE_FEE = 49.99

export function commissionableFor(productPrice: number): number {
  return Number(Math.max(0, productPrice - COMMISSIONABLE_FEE).toFixed(2))
}

interface CommissionableApp {
  healthPlanPrice?: number | null
  visionAndDentalPlan?: boolean | null
  visionAndDentalPrice?: number | null
  ancillaryPlans?: ({ price?: number | null } | null)[] | null
}

// Commissionable for each product on an application, plus the total.
export function commissionableBreakdown(app: CommissionableApp) {
  const plan = app.healthPlanPrice != null ? commissionableFor(app.healthPlanPrice) : 0
  const dentalVision =
    app.visionAndDentalPlan && app.visionAndDentalPrice != null
      ? commissionableFor(app.visionAndDentalPrice)
      : 0
  let ancillary = 0
  for (const p of app.ancillaryPlans || []) {
    if (p?.price != null) ancillary += commissionableFor(p.price)
  }
  ancillary = Number(ancillary.toFixed(2))
  return { plan, dentalVision, ancillary, total: Number((plan + dentalVision + ancillary).toFixed(2)) }
}

export function commissionableForApplication(app: CommissionableApp): number {
  return commissionableBreakdown(app).total
}
