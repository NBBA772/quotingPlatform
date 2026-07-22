<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ heading }}</h2>
      <NuxtLink
        :to="`/group-intake?type=${mode}`"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
      >
        + New {{ mode === 'custom' ? 'Custom Company' : 'Group' }}
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>
    <div v-else-if="companies.length === 0" class="text-gray-500 dark:text-gray-300">
      No {{ mode }} companies yet.
    </div>

    <table v-else class="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <tbody>
        <template v-for="company in companies" :key="company.id">
          <!-- Company header row + add-member action -->
          <tr class="bg-gray-200 dark:bg-[#243021]">
            <td colspan="4" class="p-3 font-bold dark:text-white">
              {{ company.companyName }}
              <span class="text-gray-500 dark:text-gray-400 font-normal">
                · Code {{ company.businessCode }} · {{ (company.employees || []).length }} member(s)
              </span>
              <button
                type="button"
                class="ml-3 text-sm font-normal bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                @click="openAddEnrollee(company)"
              >
                + Add Enrollee
              </button>
            </td>
          </tr>

          <!-- Member rows with the same Application / Enroll actions as individuals -->
          <tr
            v-for="emp in company.employees"
            :key="`c-${company.id}-e-${emp.id}`"
            class="hover:bg-gray-50 dark:hover:bg-[#2d3a2a]"
          >
            <td class="p-2 pl-6 dark:text-white">{{ emp.firstName }} {{ emp.lastName }}</td>
            <td class="p-2 dark:text-white">{{ emp.email }}</td>
            <td class="p-2 dark:text-white">{{ emp.phone || '—' }}</td>
            <td class="p-2 dark:text-white">
              <div class="flex items-center gap-2">
                <template v-if="emp.hasSignedApplication">
                  <span class="text-green-600 dark:text-green-400 font-semibold">Application Signed</span>
                </template>
                <template v-else>
                  <button
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    @click="openApplication(emp)"
                  >
                    Application
                  </button>
                  <button
                    class="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    @click="startEnrollment(emp)"
                  >
                    Enroll
                  </button>
                </template>
                <button
                  class="ml-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
                  title="Load the application to fix mistakes and regenerate the PDF"
                  @click="startEnrollment(emp)"
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-800 ml-auto"
                  title="Delete enrollee permanently"
                  @click="permanentDeleteEnrollee(company, emp)"
                >
                  <Icon name="mdi:delete-forever" size="20" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="(company.employees || []).length === 0">
            <td colspan="4" class="p-2 pl-6 text-gray-500 dark:text-gray-400 italic">
              No members yet — use “+ Add Enrollee” to add one.
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Application modal (same form the individual/family flow uses) -->
    <Transition name="fade-zoom">
      <div v-if="showAppModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-lg p-6 w-3/4 max-h-[100vh] overflow-y-auto">
          <InsuranceProductForm
            v-if="appUserId !== null && appModel.application !== undefined"
            :key="appUserId + '-' + (appModel.application?.id || 'new')"
            :userId="appUserId"
            :application="appModel.application"
          />
          <p v-else class="text-gray-500 dark:text-gray-400 mt-2">Loading enrollee info…</p>
          <button class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" @click="closeApplication">Close</button>
        </div>
      </div>
    </Transition>

    <!-- Add-enrollee modal -->
    <Transition name="fade-zoom">
      <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-lg p-6 w-full max-w-lg">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-1">
            Add Enrollee — {{ addCompany?.companyName }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">
            Fill this out with the enrollee on the phone; set a login password together.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">First Name</label>
              <input v-model="addForm.contactFirstName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Last Name</label>
              <input v-model="addForm.contactLastName" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email</label>
              <input v-model="addForm.contactEmail" type="email" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Mobile Phone</label>
              <input v-model="addForm.contactPhone" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Password</label>
              <input v-model="addForm.contactPassword" type="password" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
            <div>
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Confirm Password</label>
              <input v-model="addPasswordConfirm" type="password" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
            </div>
          </div>
          <p v-if="addError" class="text-red-600 dark:text-red-400 mt-3">{{ addError }}</p>
          <div class="flex justify-end gap-3 mt-4">
            <button class="px-4 py-2 bg-gray-400 text-white rounded" @click="closeAdd">Cancel</button>
            <button
              class="px-5 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937]"
              :disabled="addSaving"
              @click="submitAddEnrollee"
            >
              {{ addSaving ? 'Adding…' : 'Add & Continue' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCookie } from '#imports'

const props = defineProps<{ mode: 'group' | 'custom' }>()

const heading = props.mode === 'custom' ? 'Custom Companies' : 'Group Companies'
const authToken = useCookie('auth_token').value
const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {}

const companies = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const load = async () => {
  loading.value = true
  try {
    const res: any = await $fetch('/api/leads/accepted', {
      method: 'GET',
      query: { enrollmentType: props.mode },
    })
    companies.value = res.assigned || []
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load companies'
  } finally {
    loading.value = false
  }
}

// --- Member id resolution (employees carry their linked user) ---
const memberUserId = (emp: any): number | null => emp.user?.id || emp.userId || null

// --- Application modal ---
const showAppModal = ref(false)
const appUserId = ref<number | null>(null)
const appModel = ref<any>({ application: undefined })

const openApplication = async (emp: any) => {
  const uid = memberUserId(emp)
  appModel.value = { application: undefined }
  showAppModal.value = true
  appUserId.value = uid
  if (!uid) {
    appModel.value.application = null
    return
  }
  const existingApp = await $fetch(`/api/applications/${uid}`).catch(() => null)
  appModel.value.application = (existingApp as any)?.userId === uid ? existingApp : null
}
const closeApplication = () => {
  showAppModal.value = false
  appUserId.value = null
  appModel.value = { application: undefined }
}

const permanentDeleteEnrollee = async (company: any, emp: any) => {
  if (!confirm(`PERMANENTLY delete ${emp.firstName} ${emp.lastName}? This removes their account and all their data and cannot be undone.`)) return
  try {
    await $fetch(`/api/employee/${emp.id}/permanent`, {
      method: 'DELETE',
      headers: authHeaders,
    })
    company.employees = (company.employees || []).filter((e: any) => e.id !== emp.id)
  } catch (err: any) {
    console.error('Error deleting enrollee:', err)
    alert(err?.data?.statusMessage || 'Failed to delete enrollee')
  }
}

const startEnrollment = async (emp: any) => {
  const uid = memberUserId(emp)
  if (!uid) {
    alert('No user account found for this member.')
    return
  }
  await navigateTo(`/enroll/${uid}/applicant`)
}

// --- Add enrollee modal ---
const showAddModal = ref(false)
const addCompany = ref<any>(null)
const addSaving = ref(false)
const addError = ref('')
const addPasswordConfirm = ref('')
const blankAdd = () => ({ contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '', contactPassword: '' })
const addForm = ref(blankAdd())

const openAddEnrollee = (company: any) => {
  addCompany.value = company
  addForm.value = blankAdd()
  addPasswordConfirm.value = ''
  addError.value = ''
  showAddModal.value = true
}
const closeAdd = () => {
  showAddModal.value = false
  addCompany.value = null
}

const submitAddEnrollee = async () => {
  addError.value = ''
  const f = addForm.value
  if (!f.contactFirstName || !f.contactLastName || !f.contactEmail || !f.contactPhone) {
    addError.value = 'All fields are required.'
    return
  }
  if (f.contactPassword.length < 8) {
    addError.value = 'Password must be at least 8 characters.'
    return
  }
  if (f.contactPassword !== addPasswordConfirm.value) {
    addError.value = 'Passwords do not match.'
    return
  }
  addSaving.value = true
  try {
    const res: any = await $fetch(`/api/companies/${addCompany.value.id}/add-enrollee`, {
      method: 'POST',
      headers: authHeaders,
      body: { ...f },
    })
    closeAdd()
    // Straight into the enrollment form for the new enrollee.
    if (res?.employeeUserId) await navigateTo(`/enroll/${res.employeeUserId}/applicant`)
    else await load()
  } catch (err: any) {
    addError.value = err?.data?.statusMessage || err?.message || 'Failed to add enrollee'
  } finally {
    addSaving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.fade-zoom-enter-active,
.fade-zoom-leave-active { transition: all 0.2s ease; }
.fade-zoom-enter-from,
.fade-zoom-leave-to { opacity: 0; transform: scale(0.97); }
</style>
