<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <h2 class="text-xl font-bold mb-4">Application</h2>

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">
      Loading applications...
    </div>

    <div v-else-if="loggedInUser">
      <!-- The form loads any existing application itself and opens in the
           saved state with an Edit button, so the enrollee can always update it -->
      <InsuranceProductForm
        :key="`app-${loggedInUser.id}`"
        :userId="loggedInUser.id"
      />

      <!-- Payment (locked until the agent completes plan selection) -->
      <div v-if="application?.id" class="mt-6">
        <EnrollPaymentForm :application-id="application.id" />
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'

const application = ref<any | null>(null)
const loading = ref(true)
const loggedInUser = ref<any>(null)

const authCookie = useAuthCookie()

async function getLoggedInUser() {
  try {
    if (!authCookie.value) return null
    const response = await $fetch(`/api/user`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    return response.user || response
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return null
  }
}

onMounted(async () => {
  loading.value = true
  loggedInUser.value = await getLoggedInUser()
  if (!loggedInUser.value) {
    loading.value = false
    return
  }

  try {
    const apps: any = await $fetch("/api/applications/my")
    application.value = Array.isArray(apps) && apps.length > 0 ? apps[0] : null
  } catch (err) {
    console.error("Failed to fetch application:", err)
  }

  loading.value = false
})
</script>

<style scoped>
table {
  min-width: 100%;
}
</style>
