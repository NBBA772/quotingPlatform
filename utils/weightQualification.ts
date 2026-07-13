// Underwriting weight limits by gender. Used by the enrollment forms to
// flag unqualified applicants before the application proceeds.
export const WEIGHT_LIMITS = { male: 350, female: 300 }

export function weightDisqualification(
  gender: string | null | undefined,
  weight: string | number | null | undefined,
): string | null {
  const w = parseFloat(String(weight ?? '').replace(/[^\d.]/g, ''))
  if (!w || isNaN(w)) return null

  const g = String(gender ?? '').trim().toLowerCase()
  const limit = g.startsWith('m') ? WEIGHT_LIMITS.male : g.startsWith('f') ? WEIGHT_LIMITS.female : null
  if (limit == null || w <= limit) return null

  return `You are not qualified because of weight. The male limit is ${WEIGHT_LIMITS.male} lbs and the female limit is ${WEIGHT_LIMITS.female} lbs.`
}
