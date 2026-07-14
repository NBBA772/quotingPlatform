<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6 my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">New Enrollee</h2>

    <!-- Success state -->
    <div v-if="result" class="space-y-4">
      <div class="text-center py-4">
        <div class="text-green-600 dark:text-green-400 text-5xl mb-3">✓</div>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
          {{ result.enrolleeName }} added
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          <template v-if="result.emailSent">
            A welcome email was sent to <b>{{ form.contactEmail }}</b>.
          </template>
          <template v-else>
            They can log in with the email and password you set together.
          </template>
        </p>
      </div>

      <div class="flex justify-center space-x-3">
        <NuxtLink
          :to="`/enroll/${result.employeeUserId}/applicant`"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        >
          Start Insurance Application
        </NuxtLink>
        <button type="button" class="px-4 py-2 bg-gray-400 text-white rounded-lg" @click="reset">
          Add Another Enrollee
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Step Progress -->
      <div class="flex items-center space-x-2">
        <div
          v-for="(s, i) in steps"
          :key="i"
          class="flex-1 h-2 rounded-full"
          :class="[currentStep >= i ? 'bg-blue-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600']"
        ></div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-300">
        Step {{ currentStep + 1 }} of {{ steps.length }}: {{ steps[currentStep] }}
      </p>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="submitForm">

        <!-- Step 1. Enrollee -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 0" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-300">
              The person you're enrolling — fill this out with them on the phone.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">First Name</label>
                <input type="text" v-model="form.contactFirstName"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Last Name</label>
                <input type="text" v-model="form.contactLastName"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email</label>
                <input type="email" v-model="form.contactEmail"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Mobile Phone (for text codes)</label>
                <input type="text" v-model="form.contactPhone"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Step 2. Address -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 1" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Street Address</label>
                <input type="text" v-model="form.streetAddress"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">City</label>
                <input type="text" v-model="form.city"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">State / Province</label>
                <input type="text" v-model="form.state"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">ZIP / Postal Code</label>
                <input type="text" v-model="form.zipCode"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Step 3. Account -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 2" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-300">
              Set a login password with the enrollee — they'll use their email and this password to sign in.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Password</label>
                <input type="password" v-model="form.contactPassword"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Confirm Password</label>
                <input type="password" v-model="contactPasswordConfirm"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="flex items-center text-gray-700 dark:text-gray-300 font-medium mb-1">
                  NPN
                  <span class="relative group ml-1 cursor-help">
                    <span class="text-gray-400 dark:text-gray-500">ⓘ</span>
                    <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-64 px-3 py-2 text-xs font-normal text-white bg-gray-800 dark:bg-gray-700 rounded-md shadow-lg z-10">
                      National Producer Number is the identification number for your agent
                    </span>
                  </span>
                </label>
                <input type="text" v-model="form.npn"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Step 4. Review -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 3" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-300">
              Read this back to the enrollee before creating their account.
            </p>
            <div class="border rounded-xl p-5 dark:border-gray-600">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div v-for="row in reviewRows" :key="row.label" class="flex justify-between md:block">
                  <dt class="text-gray-500 dark:text-gray-400">{{ row.label }}</dt>
                  <dd class="text-gray-800 dark:text-white font-medium">{{ row.value || '—' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Transition>

        <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>

        <!-- Navigation -->
        <div class="flex justify-between pt-4">
          <button type="button" @click="prevStep" :disabled="currentStep === 0"
                  class="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50">Back</button>
          <button v-if="currentStep < steps.length - 1" type="button" @click="nextStep"
                  class="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
          <button v-else type="submit" :disabled="saving"
                  class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
            {{ saving ? 'Creating…' : 'Add Enrollee' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useCookie } from '#imports'

definePageMeta({ middleware: 'auth' })

const steps = ['Enrollee', 'Address', 'Account', 'Review']
const currentStep = ref(0)

const blank = () => ({
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  contactPassword: '',
  npn: '',
})

const form = reactive(blank())
const contactPasswordConfirm = ref('')
const saving = ref(false)
const error = ref('')
const result = ref<{
  enrolleeName: string
  employeeUserId: number
  emailSent: boolean
} | null>(null)

// Required fields per step, checked before advancing
const stepRequirements: Record<number, { field: keyof ReturnType<typeof blank>; label: string }[]> = {
  0: [
    { field: 'contactFirstName', label: 'First Name' },
    { field: 'contactLastName', label: 'Last Name' },
    { field: 'contactEmail', label: 'Email' },
    { field: 'contactPhone', label: 'Mobile Phone' },
  ],
  1: [
    { field: 'streetAddress', label: 'Street Address' },
    { field: 'city', label: 'City' },
    { field: 'state', label: 'State' },
    { field: 'zipCode', label: 'ZIP Code' },
  ],
}

const reviewRows = computed(() => [
  { label: 'Enrollee', value: `${form.contactFirstName} ${form.contactLastName}`.trim() },
  { label: 'Email', value: form.contactEmail },
  { label: 'Mobile Phone', value: form.contactPhone },
  { label: 'Address', value: [form.streetAddress, form.city, form.state, form.zipCode].filter(Boolean).join(', ') },
  { label: 'NPN', value: form.npn },
])

const nextStep = () => {
  error.value = ''
  for (const req of stepRequirements[currentStep.value] || []) {
    if (!String(form[req.field]).trim()) {
      error.value = `${req.label} is required.`
      return
    }
  }
  // Password checks on the Account step
  if (currentStep.value === 2) {
    if (form.contactPassword.length < 8) {
      error.value = 'Password must be at least 8 characters.'
      return
    }
    if (form.contactPassword !== contactPasswordConfirm.value) {
      error.value = 'Passwords do not match.'
      return
    }
  }
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const prevStep = () => {
  error.value = ''
  if (currentStep.value > 0) currentStep.value--
}

async function submitForm() {
  error.value = ''
  saving.value = true
  try {
    const authToken = useCookie('auth_token').value
    const res: any = await $fetch('/api/companies/intake', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: { ...form },
    })
    result.value = {
      enrolleeName: res.employeeName,
      employeeUserId: res.employeeUserId,
      emailSent: res.emailSent,
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to add enrollee'
  } finally {
    saving.value = false
  }
}

function reset() {
  Object.assign(form, blank())
  contactPasswordConfirm.value = ''
  currentStep.value = 0
  result.value = null
  error.value = ''
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
  overflow: hidden;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}
</style>
