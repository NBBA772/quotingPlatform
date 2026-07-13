<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <h2 class="text-xl font-bold mb-4">Application</h2>

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">
      Loading applications...
    </div>

    <div v-else-if="applications.length === 0 && !hasPaymentAuth" class="text-gray-500 dark:text-gray-300">
      No applications or payment authorizations found.
    </div>

    <div v-if="loggedInUser">
      <!-- <div v-if="loggedInUser && !isEmployee"> BUG??-->
        <!-- 2️⃣ Show Application Form ONLY if payment is authorized -->
        <InsuranceProductForm
          v-if="loggedInUser && (!application?.id || application.id === null)"
          :key="`app-${loggedInUser.id}`"
          :userId="loggedInUser.id"
        />

        <!-- 3️⃣ Show Employee Sign ONLY if both exist -->
        <EmployeeSignApplication
          v-else-if="loggedInUser && application?.id"
          :key="`sign-${loggedInUser.id}`"
          :application="application"
        />

                <!-- 1️⃣ Show Payment Authorization FIRST if not signed -->
        <PaymentAuthorizationForm
          v-else-if="loggedInUser && !hasPaymentAuth"
          :key="`pay-${loggedInUser.id}`"
          :userId="loggedInUser.id"
          @completed="onPaymentCompleted"
        />

        <!-- 4️⃣ Once signed, the client pays here -->
        <div v-if="applicationSigned" class="mt-6">
          <EnrollPaymentForm :application-id="application.id" />
        </div>
    </div>
    <div v-else-if="!loading && isEmployee">
              <!-- 2️⃣ Show Application Form ONLY if payment is authorized -->
        <InsuranceProductForm
          v-if="loggedInUser &&  (!application?.id || application.id === null)"
          :key="`app-${loggedInUser.id}`"
          :userId="loggedInUser.id"
        />

        <!-- 3️⃣ Show Employee Sign ONLY if both exist -->
        <EmployeeSignApplication
          v-else-if="loggedInUser && application?.id"
          :key="`sign-${loggedInUser.id}`"
          :application="application"
        />

        <!-- 4️⃣ Once signed, the client pays here -->
        <div v-if="applicationSigned" class="mt-6">
          <EnrollPaymentForm :application-id="application.id" />
        </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEmployee } from '~/composables/useEmployee'

const isEmployee = ref(false)

interface Application {
  id: number | null
  name: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

const applications = ref<Application[]>([])
const application = ref<any | null>(null)

// Payment opens once the application is signed (either signing flow)
const applicationSigned = computed(() =>
  !!application.value?.id &&
  (!!application.value?.signedAt || ['signed', 'paid'].includes(application.value?.status)),
)
const loading = ref(true)
const loggedInUser = ref<any>(null)
const hasPaymentAuth = ref(false)

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

  // Check if user is employee
  isEmployee.value = await useEmployee(loggedInUser.value.id)

  // Fetch applications
  const apps = await $fetch("/api/applications/my")
  applications.value = apps
  application.value = apps.length > 0 ? apps[0] : {
    id: null,
    name: "",
    description: "",
    status: "PENDING",
    requestedAt: new Date().toISOString(),
  }

  // Fetch payment authorizations
  const paymentAuths = await $fetch("/api/payment-authorization/my")
  hasPaymentAuth.value = Array.isArray(paymentAuths) && paymentAuths.length > 0

  loading.value = false
})

async function onPaymentCompleted() {
  // Re-fetch payment authorizations
  const paymentAuths = await $fetch("/api/payment-authorization/my")
  hasPaymentAuth.value = Array.isArray(paymentAuths) && paymentAuths.length > 0
}



</script>

<style scoped>
table {
  min-width: 100%;
}
</style>
