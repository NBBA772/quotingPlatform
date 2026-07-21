<template>
  <PatternSection>
    <div>
      <!-- Dashboard Content -->
      <div class="max-w-7xl mx-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start transition-all duration-500 ease-in-out">

          <!-- Sidebar -->
          <!-- <Transition name="slide-aside">
            <aside v-if="tab !== 'debate'" class="md:col-span-1">
              <div class="bg-white dark:bg-[#3a4934] shadow-md rounded-lg p-4">
                <CompanyEmployeeDropdown
                  @update:selectedCompany="onCompanySelect"
                  @update:selectedEmployee="onEmployeeSelect"
                />
              </div>
            </aside>
          </Transition> -->

          <!-- Main Section -->
          <section
            class="transition-all duration-500 ease-in-out"
            :class="(tab === 'live' || tab === 'debate') ? 'md:col-span-3' : 'md:col-span-2'"
          >
            <!-- Tabs -->
            <div class="relative border-b border-gray-300 dark:border-gray-600 mb-4">
              <ul class="flex space-x-4 bg-white dark:bg-[#3a4934] p-4 shadow-md relative">
                <li
                  v-for="(t, index) in tabs"
                  :key="t.key"
                  ref="tabRefs"
                  class="cursor-pointer pb-2 relative"
                  :class="tab === t.key ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'"
                  @click="setTab(t.key)"
                >
                  {{ t.label }}
                </li>

                <!-- Sliding underline -->
                <div
                  class="absolute bottom-0 h-1 bg-blue-500 transition-all duration-300"
                  :style="{ width: underlineWidth + 'px', transform: `translateX(${underlineX - 30}px)` }"
                ></div>
              </ul>
            </div>

            <!-- Tab Content with animation -->
            <Transition name="fade-slide" mode="out-in">
              <div :key="tab">
                <div v-if="tab === 'payments'">
                  <PaymentsDashboard />
                </div>
                <div v-else-if="tab === 'employees'">
                  <EmployeeDetails :employee="selectedEmployee" />
                </div>
                <!-- <div v-else-if="tab === 'inactive'">
                  <InactiveEmployees />
                </div> -->

                <div v-else-if="tab === 'insuranceAgents'">
                  <AddInsuranceAgent />
                  <InsuranceAgentDetails />
                </div>

                <div v-else-if="tab === 'auditTrailList'">
                  <AuditTrailList />
                </div>

                <div v-else-if="tab === 'paymentAuthAuditTrailList'">
                  <PaymentAuthAuditTrailList />
                </div>


                <div v-else-if="tab === 'adminOverview'">
                  <AddAppAdmin />
                  <adminOverview />
                </div>

                <div v-else-if="tab === 'CompanyAgentAssignments'">
                  <CompanyAgentAssignments />
                </div>

                <div v-else-if="tab === 'customPlans'">
                  <CustomPlansManager />
                </div>


                


                <!-- <div v-else-if="tab === 'leads'">
                  <InsuranceAgentLeadUpload />
                </div>

                <div v-else-if="tab === 'seoRequest'">
                  <AppAdminSeoRequestsList :company="selectedCompany" />
                </div>
                <div v-else-if="tab === 'webDevelopmentRequest'">
                  <AppAdminWebDevelopmentRequestsList :company="selectedCompany" />
                </div> -->
              </div>
            </Transition>
          </section>
        </div>
      </div>
    </div>
  </PatternSection>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'

const loggedInUser = ref(null)
const authCookie = useAuthCookie()

const tab = ref('payments')
const selectedEmployee = ref(null)
const selectedCompany = ref<any>(null)

// Tabs & underline state
const tabs = [
  
  //{ key: 'employees', label: 'Insurance Cards' },
  // { key: 'inactive', label: 'Former Employees' },
  { key: 'insuranceAgents', label: 'Manage Insurance Agents' },
   { key: 'CompanyAgentAssignments', label: 'Manage Clients' },
  { key: 'customPlans', label: 'Custom Plans' },
  { key: 'adminOverview', label: 'Manage Admins' },
  { key: 'auditTrailList', label: 'Enrollment Requests' },
  { key: 'payments', label: 'Payments' },
 // { key: 'paymentAuthAuditTrailList', label: 'Payment Authorization Requests' },
  //   { key: 'leads', label: 'Leads' },
  // { key: 'seoRequest', label: 'SEO Request' },
  // { key: 'webDevelopmentRequest', label: 'Web Development Request' },
]
const tabRefs = ref<HTMLElement[]>([])
const underlineX = ref(0)
const underlineWidth = ref(0)

// Fetch logged-in user
async function getLoggedInUser() {
  try {
    if (!authCookie.value) return null
    const response = await $fetch(`/api/user`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    return response.user || response
  } catch (err) {
    console.error('Error fetching user:', err)
    return null
  }
}

// Set active tab
function setTab(tabName: string) {
  tab.value = tabName
  nextTick(updateUnderline)
}

// Update sliding underline
function updateUnderline() {
  const index = tabs.findIndex(t => t.key === tab.value)
  const tabEl = tabRefs.value[index]
  if (tabEl) {
    underlineX.value = tabEl.offsetLeft
    underlineWidth.value = tabEl.offsetWidth
  }
}

onMounted(async () => {
  loggedInUser.value = await getLoggedInUser()
  nextTick(updateUnderline)
})

// Handlers for dropdown selections
const onCompanySelect = (company: any) => { selectedCompany.value = company }
const onEmployeeSelect = (employee: any) => { selectedEmployee.value = employee }
</script>

<style scoped>
/* Sidebar slide animation */
.slide-aside-enter-active,
.slide-aside-leave-active {
  transition: all 0.5s ease;
}
.slide-aside-enter-from,
.slide-aside-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Tab content fade + slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
