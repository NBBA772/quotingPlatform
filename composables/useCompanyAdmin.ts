export async function useCompanyAdmin(userId: number): Promise<boolean> {
  try {
    const res = await $fetch(`/api/is-company-admin/${userId}`)
    return res.isCompanyAdmin === true
  } catch (err) {
    console.error("Error in useCompanyAdmin:", err)
    return false
  }
}
