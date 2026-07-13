<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6 my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">New Company</h2>

    <!-- Success state -->
    <div v-if="result" class="space-y-4">
      <div class="text-center py-4">
        <div class="text-green-600 dark:text-green-400 text-5xl mb-3">✓</div>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
          Company created — Group #{{ result.businessCode }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          <b>{{ result.employeeName }}</b> was added as the company's first employee.
          <template v-if="result.emailSent">
            Their login details were emailed to <b>{{ form.contactEmail }}</b>.
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
          Start Another Company
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

        <!-- Step 1. Company Info -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 0" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company Name</label>
                <input type="text" v-model="form.companyName"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">EIN #</label>
                <input type="text" v-model="form.ein"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Industry</label>
                <input type="text" v-model="form.industry"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Employee Count</label>
                <input type="number" v-model="form.employeeSize" min="1"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Salesman Code</label>
                <input type="text" v-model="form.salesmanCode"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
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

        <!-- Step 3. Company Contact -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 2" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company Phone</label>
                <input type="text" v-model="form.phoneNumber"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company Email</label>
                <input type="email" v-model="form.companyEmail"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                      required />
              </div>
              <div>
                <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Website</label>
                <input type="text" v-model="form.website"
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
              </div>
            </div>
          </div>
        </Transition>

        <!-- Step 4. Primary Contact (becomes the first employee) -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 3" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-300">
              The client — they'll be added as the company's first employee.
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
                      class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
              </div>
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
            </div>
          </div>
        </Transition>

        <!-- Step 5. Review -->
        <Transition name="fade-slide" mode="out-in">
          <div v-if="currentStep === 4" class="space-y-4">
            <p class="text-sm text-gray-500 dark:text-gray-300">
              Read this back to the client before creating the company.
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
            {{ saving ? 'Creating…' : 'Create Company & Add Employee' }}
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

const steps = ['Company', 'Address', 'Contact Info', 'Employee', 'Review']
const currentStep = ref(0)

const blank = () => ({
  companyName: '',
  ein: '',
  salesmanCode: '',
  industry: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  phoneNumber: '',
  companyEmail: '',
  website: '',
  employeeSize: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  contactPassword: '',
})

const form = reactive(blank())
const contactPasswordConfirm = ref('')
const saving = ref(false)
const error = ref('')
const result = ref<{
  businessCode: string
  employeeUserId: number
  employeeName: string
  emailSent: boolean
} | null>(null)

// Required fields per step, checked before advancing
const stepRequirements: Record<number, { field: keyof ReturnType<typeof blank>; label: string }[]> = {
  0: [
    { field: 'companyName', label: 'Company Name' },
    { field: 'industry', label: 'Industry' },
    { field: 'employeeSize', label: 'Employee Count' },
  ],
  1: [
    { field: 'streetAddress', label: 'Street Address' },
    { field: 'city', label: 'City' },
    { field: 'state', label: 'State' },
    { field: 'zipCode', label: 'ZIP Code' },
  ],
  2: [
    { field: 'phoneNumber', label: 'Company Phone' },
    { field: 'companyEmail', label: 'Company Email' },
  ],
  3: [
    { field: 'contactFirstName', label: 'First Name' },
    { field: 'contactLastName', label: 'Last Name' },
    { field: 'contactEmail', label: 'Email' },
  ],
}

const reviewRows = computed(() => [
  { label: 'Company Name', value: form.companyName },
  { label: 'EIN #', value: form.ein },
  { label: 'Industry', value: form.industry },
  { label: 'Employee Count', value: form.employeeSize },
  { label: 'Salesman Code', value: form.salesmanCode },
  { label: 'Address', value: [form.streetAddress, form.city, form.state, form.zipCode].filter(Boolean).join(', ') },
  { label: 'Company Phone', value: form.phoneNumber },
  { label: 'Company Email', value: form.companyEmail },
  { label: 'Website', value: form.website },
  { label: 'Employee', value: `${form.contactFirstName} ${form.contactLastName}`.trim() },
  { label: 'Employee Email', value: form.contactEmail },
  { label: 'Employee Phone', value: form.contactPhone },
])

const nextStep = () => {
  error.value = ''
  for (const req of stepRequirements[currentStep.value] || []) {
    if (!String(form[req.field]).trim()) {
      error.value = `${req.label} is required.`
      return
    }
  }
  // Password checks on the Employee step
  if (currentStep.value === 3) {
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
    result.value = res
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to create company'
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
