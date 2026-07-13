export async function useEmployee(userId: number): Promise<boolean> {
  try {
    const res = await $fetch(`/api/is-employee/${userId}`)
    return res.isEmployee === true
  } catch (err) {
    console.error("Error in useEmployee:", err)
    return false
  }
}
