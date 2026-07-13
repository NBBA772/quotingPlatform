import { useCookie } from '#imports'

// Shared helpers for the paged enrollment flow (/enroll/[userId]/*).
// The application record is the single source of truth between pages:
// each page loads it on mount and persists its step before navigating on.

export function useEnrollmentAuthHeaders() {
  const authToken = useCookie('auth_token').value
  return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

export async function fetchEnrollmentApplication(userId: number) {
  const res: any = await $fetch(`/api/applications/${userId}`, {
    headers: useEnrollmentAuthHeaders(),
  })
  return {
    application: res?.application ?? null,
    businessCode: res?.bCode ?? null,
  }
}

// Persists a partial update by merging it over the existing application.
// The create endpoint upserts by userId, so this works for both first
// save and later steps.
export async function saveEnrollmentStep(userId: number, existing: any, patch: Record<string, any>) {
  const base = existing ? { ...existing } : {}
  // relations/metadata the create endpoint doesn't accept as-is
  delete base.user
  delete base.auditTrails
  delete base.underwritingAnswers

  const body = {
    groupName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    isDivision: false,
    ...base,
    ...patch,
    userId,
  }

  const res: any = await $fetch('/api/applications/create', {
    method: 'POST',
    headers: useEnrollmentAuthHeaders(),
    body,
  })
  return res?.application ?? null
}
