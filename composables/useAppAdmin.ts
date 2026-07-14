import { computed, ref, onMounted } from 'vue'
import { useUser } from '@/composables/useAuth'

export async function useAppAdmin(userId: number): Promise<boolean> {
  try {
    const res = await $fetch(`/api/is-app-admin/${userId}`)
    return res.isAdmin === true
  } catch (err) {
    console.error("Error in useAppAdmin:", err)
    return false
  }
}