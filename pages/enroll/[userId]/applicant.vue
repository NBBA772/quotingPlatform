<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Applicant Information</h2>
    <EnrollSteps :current="0" />

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>

    <form v-else class="space-y-6" @submit.prevent="next">

      <!-- Group -->
      <div class="border rounded-xl p-5 dark:border-gray-600 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Enrollee</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Agent Name</label>
            <input type="text" v-model="form.groupName"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Coverage</label>
            <select v-model="form.coverageTier" required
                    class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
              <option value="">Select coverage</option>
              <option v-for="tier in coverageTiers" :key="tier.value" :value="tier.value">{{ tier.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Personal -->
      <div class="border rounded-xl p-5 dark:border-gray-600 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Personal</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">First Name</label>
            <input type="text" v-model="form.firstName" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Middle Name</label>
            <input type="text" v-model="form.middleName"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Last Name</label>
            <input type="text" v-model="form.lastName" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Phone Number</label>
            <input type="text" v-model="form.phoneNumber" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email</label>
            <input type="email" v-model="form.email" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Social Security Number</label>
            <input type="text" v-model="form.socialSecurityNumber" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Date Of Birth</label>
            <input type="date" v-model="form.dateOfBirth" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Age</label>
            <input type="text" v-model="form.age"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Gender</label>
            <select v-model="form.gender"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Weight</label>
            <input type="text" v-model="form.weight"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Height</label>
            <input type="text" v-model="form.height"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>
      </div>

      <!-- Address -->
      <div class="border rounded-xl p-5 dark:border-gray-600 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Street Address</label>
            <input type="text" v-model="form.streetAddress" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">City</label>
            <input type="text" v-model="form.city" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">State / Province</label>
            <input type="text" v-model="form.state" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">ZIP / Postal Code</label>
            <input type="text" v-model="form.zipCode" required
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>
      </div>

      <!-- Spouse -->
      <div v-if="showSpouse" class="border rounded-xl p-5 dark:border-gray-600 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Spouse</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">First Name</label>
            <input type="text" v-model="form.spouseFirstName"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Middle Name</label>
            <input type="text" v-model="form.spouseMiddleName"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Last Name</label>
            <input type="text" v-model="form.spouseLastName"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Social Security Number</label>
            <input type="text" v-model="form.spouseSocialSecurityNumber"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Date Of Birth</label>
            <input type="date" v-model="form.spouseDateOfBirth"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Age</label>
            <input type="text" v-model="form.spouseAge"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Gender</label>
            <select v-model="form.spouseGender"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Weight</label>
            <input type="text" v-model="form.spouseWeight"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Height</label>
            <input type="text" v-model="form.spouseHeight"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>
      </div>

      <!-- Dependents -->
      <div v-if="showDependents" class="border rounded-xl p-5 dark:border-gray-600 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Dependents</h3>

        <div v-for="(dep, index) in form.dependents" :key="index"
             class="border p-4 rounded bg-gray-50 dark:bg-[#2d3a2a] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">First Name</label>
            <input v-model="dep.firstName" type="text" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
            <input v-model="dep.lastName" type="text" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Social Security Number</label>
            <input v-model="dep.socialSecurityNumber" type="text" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input v-model="dep.dateOfBirth" type="date" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select v-model="dep.gender" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
            <input v-model="dep.relationship" type="text" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Weight</label>
            <input v-model="dep.weight" type="text" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 mb-1">Height</label>
            <input v-model="dep.height" type="text" class="w-full p-2 border rounded dark:bg-[#142610] dark:text-white" />
          </div>
          <div class="flex items-end">
            <button type="button"
                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    @click="form.dependents.splice(index, 1)">
              Remove
            </button>
          </div>
        </div>

        <button type="button"
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                @click="addDependent">
          Add Dependent
        </button>
      </div>

      <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>

      <!-- Weight qualification popup -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="weightPopup" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-lg p-6 max-w-md mx-4 text-center">
              <div class="text-red-600 dark:text-red-400 text-4xl mb-3">⚠</div>
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Not Qualified</h3>
              <p class="text-gray-700 dark:text-gray-300 mb-5">{{ weightPopup }}</p>
              <button
                type="button"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
                @click="weightPopup = ''"
              >
                OK
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

      <div class="flex justify-end pt-2">
        <button type="submit" :disabled="saving"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]">
          {{ saving ? 'Saving…' : 'Next: Underwriting' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { weightDisqualification } from '~/utils/weightQualification'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userId = Number(route.params.userId)

const coverageTiers = [
  { value: 'single', label: 'Single' },
  { value: 'individual_spouse', label: 'Individual and Spouse' },
  { value: 'individual_child', label: 'Individual and Child' },
  { value: 'family', label: 'Family' },
]

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const weightPopup = ref('')
const application = ref<any>(null)

const form = reactive({
  npn: '',
  groupName: '',
  coverageTier: '',
  reasons: [] as string[],
  firstName: '',
  middleName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  socialSecurityNumber: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  weight: '',
  height: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  hireDate: '',
  rehireDate: '',
  location: '',
  isDivision: false,
  parentCompany: '',
  hrsPerWeek: '',
  jobTitle: '',
  spouseFirstName: '',
  spouseMiddleName: '',
  spouseLastName: '',
  spouseSocialSecurityNumber: '',
  spouseDateOfBirth: '',
  spouseAge: '',
  spouseGender: '',
  spouseWeight: '',
  spouseHeight: '',
  dependents: [] as {
    firstName: string
    lastName: string
    socialSecurityNumber: string
    weight: string
    height: string
    dateOfBirth: string
    gender: string
    relationship: string
  }[],
})

const dateOnly = (val: any) => (val ? String(val).substring(0, 10) : '')

const showSpouse = computed(() => ['individual_spouse', 'family'].includes(form.coverageTier))
const showDependents = computed(() => ['individual_child', 'family'].includes(form.coverageTier))

onMounted(async () => {
  try {
    const { application: app } = await fetchEnrollmentApplication(userId)
    application.value = app

    if (app) {
      form.npn = app.groupNumber || ''
      form.groupName = app.groupName || ''
      form.coverageTier = app.coverageTier || ''
      form.reasons = app.reasons ? String(app.reasons).split(',').filter(Boolean) : []
      form.firstName = app.firstName || ''
      form.middleName = app.middleName || ''
      form.lastName = app.lastName || ''
      form.phoneNumber = app.phoneNumber || ''
      form.email = app.email || ''
      form.socialSecurityNumber = app.socialSecurityNumber || ''
      form.dateOfBirth = dateOnly(app.dateOfBirth)
      form.age = app.age || ''
      form.gender = app.gender || ''
      form.weight = app.weight || ''
      form.height = app.height || ''
      form.streetAddress = app.streetAddress || ''
      form.city = app.city || ''
      form.state = app.state || ''
      form.zipCode = app.zipCode || ''
      form.hireDate = dateOnly(app.hireDate)
      form.rehireDate = dateOnly(app.rehireDate)
      form.location = app.location || ''
      form.isDivision = app.isDivision ?? false
      form.parentCompany = app.parentCompany || ''
      form.hrsPerWeek = app.hrsPerWeek || ''
      form.jobTitle = app.jobTitle || ''
      form.spouseFirstName = app.spouseFirstName || ''
      form.spouseMiddleName = app.spouseMiddleName || ''
      form.spouseLastName = app.spouseLastName || ''
      form.spouseSocialSecurityNumber = app.spouseSocialSecurityNumber || ''
      form.spouseDateOfBirth = dateOnly(app.spouseDateOfBirth)
      form.spouseAge = app.spouseAge || ''
      form.spouseGender = app.spouseGender || ''
      form.spouseWeight = app.spouseWeight || ''
      form.spouseHeight = app.spouseHeight || ''
      form.dependents = (app.dependents || []).map((d: any) => ({
        firstName: d.firstName || '',
        lastName: d.lastName || '',
        socialSecurityNumber: d.socialSecurityNumber || '',
        weight: d.weight || '',
        height: d.height || '',
        dateOfBirth: dateOnly(d.dateOfBirth),
        gender: d.gender || '',
        relationship: d.relationship || '',
      }))
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load application'
  } finally {
    loading.value = false
  }
})

function addDependent() {
  form.dependents.push({
    firstName: '', lastName: '', socialSecurityNumber: '', weight: '', height: '',
    dateOfBirth: '', gender: '', relationship: '',
  })
}

async function next() {
  error.value = ''
  if (!form.coverageTier) {
    error.value = 'Select a coverage option.'
    return
  }
  const disqualified = weightDisqualification(form.gender, form.weight)
  if (disqualified) {
    weightPopup.value = disqualified
    return
  }
  saving.value = true
  try {
    const { npn, ...fields } = form as any
    fields.groupNumber = npn
    // Clear sections the selected coverage doesn't include
    if (!showSpouse.value) {
      Object.assign(fields, {
        spouseFirstName: '', spouseMiddleName: '', spouseLastName: '',
        spouseSocialSecurityNumber: '', spouseDateOfBirth: '', spouseAge: '',
        spouseGender: '', spouseWeight: '', spouseHeight: '',
      })
    }
    if (!showDependents.value) {
      fields.dependents = []
    }
    await saveEnrollmentStep(userId, application.value, fields)
    await navigateTo(`/enroll/${userId}/underwriting`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to save applicant info'
  } finally {
    saving.value = false
  }
}
</script>
