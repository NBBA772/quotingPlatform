export async function useAgentAdmin(userId: number): Promise<boolean> {
  try {
    const res = await $fetch(`/api/is-agent-admin/${userId}`)
    return res.isAgentAdmin === true
  } catch (err) {
    console.error("Error in useAgentAdmin:", err)
    return false
  }
}
