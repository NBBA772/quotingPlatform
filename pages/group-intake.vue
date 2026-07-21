<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6 my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
      New {{ isCustom ? 'Custom Company' : 'Group' }}
    </h2>

    <!-- Success state -->
    <div v-if="result" class="space-y-4">
      <div class="text-center py-4">
        <div class="text-green-600 dark:text-green-400 text-5xl mb-3">✓</div>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white">{{ result.companyName }} created</h3>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          Company code <b>{{ result.businessCode }}</b>.
          <template v-if="result.emailSent">
            A welcome email was sent to <b>{{ form.adminEmail }}</b>.
          </template>
          <template v-else>
            The company admin can log in with their email and the password you set together.
          </template>
        </p>
        <p v-if="isCustom" class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          An app admin can now build custom plans for this company from the admin dashboard.
        </p>
      </div>
      <div class="flex justify-center space-x-3">
        <NuxtLink to="/dashboard" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]">
          Back to Dashboard
        </NuxtLink>
        <button type="button" class="px-4 py-2 bg-gray-400 text-white rounded-lg" @click="reset">Add Another</button>
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

      <form class="space-y-4" @submit.prevent="submitForm">
        <!-- Step 1. Company -->
        <div v-if="currentStep === 0" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company Name</label>
              <input v-model="form.companyName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Industry</label>
              <input v-model="form.industry" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">EIN (optional)</label>
              <input v-model="form.ein" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Employee Size</label>
              <input v-model="form.employeeSize" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company Phone</label>
              <input v-model="form.companyPhone" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company Email</label>
              <input v-model="form.companyEmail" type="email" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
          </div>
        </div>

        <!-- Step 2. Address -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Street Address</label>
              <input v-model="form.streetAddress" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">City</label>
              <input v-model="form.city" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">State</label>
              <input v-model="form.state" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">ZIP Code</label>
              <input v-model="form.zipCode" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
          </div>
        </div>

        <!-- Step 3. Company Admin -->
        <div v-if="currentStep === 2" class="space-y-4">
          <p class="text-sm text-gray-500 dark:text-gray-300">
            The company's admin — they log in to add employees. Set a login password with them.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Admin First Name</label>
              <input v-model="form.adminFirstName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Admin Last Name</label>
              <input v-model="form.adminLastName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Admin Email</label>
              <input v-model="form.adminEmail" type="email" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Admin Phone</label>
              <input v-model="form.adminPhone" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Password</label>
              <input v-model="form.adminPassword" type="password" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Confirm Password</label>
              <input v-model="adminPasswordConfirm" type="password" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" required />
            </div>
          </div>
        </div>

        <!-- Step 4. Review -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div class="border rounded-xl p-5 dark:border-gray-600">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div v-for="row in reviewRows" :key="row.label">
                <dt class="text-gray-500 dark:text-gray-400">{{ row.label }}</dt>
                <dd class="text-gray-800 dark:text-white font-medium">{{ row.value || '—' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>

        <div class="flex justify-between pt-4">
          <button type="button" @click="prevStep" :disabled="currentStep === 0" class="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50">Back</button>
          <button v-if="currentStep < steps.length - 1" type="button" @click="nextStep" class="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
          <button v-else type="submit" :disabled="saving" class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
            {{ saving ? 'Creating…' : `Create ${isCustom ? 'Company' : 'Group'}` }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useCookie, useRoute } from '#imports'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const isCustom = computed(() => route.query.type === 'custom')

const steps = ['Company', 'Address', 'Admin', 'Review']
const currentStep = ref(0)

const blank = () => ({
  companyName: '', industry: '', ein: '', employeeSize: '',
  companyPhone: '', companyEmail: '',
  streetAddress: '', city: '', state: '', zipCode: '',
  adminFirstName: '', adminLastName: '', adminEmail: '', adminPhone: '', adminPassword: '',
})

const form = reactive(blank())
const adminPasswordConfirm = ref('')
const saving = ref(false)
const error = ref('')
const result = ref<{ companyName: string; businessCode: string; emailSent: boolean } | null>(null)

const stepRequirements: Record<number, { field: keyof ReturnType<typeof blank>; label: string }[]> = {
  0: [
    { field: 'companyName', label: 'Company Name' },
    { field: 'industry', label: 'Industry' },
    { field: 'employeeSize', label: 'Employee Size' },
    { field: 'companyPhone', label: 'Company Phone' },
    { field: 'companyEmail', label: 'Company Email' },
  ],
  1: [
    { field: 'streetAddress', label: 'Street Address' },
    { field: 'city', label: 'City' },
    { field: 'state', label: 'State' },
    { field: 'zipCode', label: 'ZIP Code' },
  ],
}

const reviewRows = computed(() => [
  { label: 'Company', value: form.companyName },
  { label: 'Industry', value: form.industry },
  { label: 'Employees', value: form.employeeSize },
  { label: 'Company Email', value: form.companyEmail },
  { label: 'Address', value: [form.streetAddress, form.city, form.state, form.zipCode].filter(Boolean).join(', ') },
  { label: 'Admin', value: `${form.adminFirstName} ${form.adminLastName}`.trim() },
  { label: 'Admin Email', value: form.adminEmail },
])

const nextStep = () => {
  error.value = ''
  for (const req of stepRequirements[currentStep.value] || []) {
    if (!String(form[req.field]).trim()) {
      error.value = `${req.label} is required.`
      return
    }
  }
  if (currentStep.value === 2) {
    if (form.adminPassword.length < 8) {
      error.value = 'Password must be at least 8 characters.'
      return
    }
    if (form.adminPassword !== adminPasswordConfirm.value) {
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
    const res: any = await $fetch('/api/companies/group-intake', {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: { ...form, enrollmentType: isCustom.value ? 'custom' : 'group' },
    })
    result.value = { companyName: res.companyName, businessCode: res.businessCode, emailSent: res.emailSent }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to create company'
  } finally {
    saving.value = false
  }
}

function reset() {
  Object.assign(form, blank())
  adminPasswordConfirm.value = ''
  currentStep.value = 0
  result.value = null
  error.value = ''
}
</script>
