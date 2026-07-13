export async function useInsuranceAgent(userId: number): Promise<boolean> {
  try {
    const res = await $fetch(`/api/is-insurance-agent/${userId}`)
    return res.isAgent === true
  } catch (err) {
    console.error("Error in useInsuranceAgent:", err)
    return false
  }
}
