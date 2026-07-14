<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <h2 class="text-xl font-bold mb-4">Application</h2>

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">
      Loading applications...
    </div>

    <!-- Signed: show the completed state instead of the editing components -->
    <div v-else-if="applicationSigned" class="text-center py-8 space-y-4">
      <div class="text-green-600 dark:text-green-400 text-5xl">✓</div>
      <h3 class="text-xl font-semibold text-gray-800 dark:text-white">Application Signed</h3>
      <p class="text-gray-600 dark:text-gray-300">
        Signed {{ signedDate }}. Your payment details are on file and will be processed by our office.
      </p>
      <button
        type="button"
        :disabled="downloading"
        class="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        @click="downloadSignedPdf"
      >
        {{ downloading ? 'Preparing…' : 'Download Signed Application' }}
      </button>
      <p v-if="downloadError" class="text-red-600 dark:text-red-400 text-sm">{{ downloadError }}</p>
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
import { ref, computed, onMounted } from 'vue'

const application = ref<any | null>(null)
const loading = ref(true)
const loggedInUser = ref<any>(null)
const downloading = ref(false)
const downloadError = ref('')

const applicationSigned = computed(() =>
  !!application.value?.id &&
  (!!application.value?.signedAt || ['signed', 'paid'].includes(application.value?.status)),
)

const signedDate = computed(() =>
  application.value?.signedAt
    ? new Date(application.value.signedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '',
)

async function downloadSignedPdf() {
  downloadError.value = ''
  downloading.value = true
  try {
    const res: any = await $fetch(`/api/applications/download/${application.value.id}`)
    window.open(res.url, '_blank')
  } catch (err: any) {
    downloadError.value = err?.data?.statusMessage || 'Failed to prepare the download'
  } finally {
    downloading.value = false
  }
}

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
