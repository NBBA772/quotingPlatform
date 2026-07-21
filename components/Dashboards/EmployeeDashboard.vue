<template>
  <PatternSection>
    <div>
      <div class="max-w-7xl mx-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start transition-all duration-500 ease-in-out">


          <!-- Main Section -->
          <Transition name="slide-aside">
            <section class="md:col-span-2 transition-all duration-500 ease-in-out">
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
                  <div
                    class="absolute bottom-0 h-1 bg-blue-500 transition-all duration-300"
                    :style="{ width: underlineWidth + 'px', transform: `translateX(${underlineX}px)` }"
                  ></div>
                </ul>
              </div>

              <!-- Tab Content -->
              <Transition name="fade-slide" mode="out-in">
                <div :key="tab">
                  <!-- <PlanBenefitDisplay :userId="selectedEmployee || loggedInUser?.id" v-if="tab==='planBenefits'" />
                  <ProviderNetworkDisplay :userId="selectedEmployee || loggedInUser?.id" v-if="tab==='providerNetwork'" />
                  <ClaimsSupportDisplay :userId="selectedEmployee || loggedInUser?.id" v-if="tab==='claimsSupport'" />
                  <PlanDetailsDisplay :userId="selectedEmployee || loggedInUser?.id" v-if="tab==='planDetails'" /> -->

                  <Application v-if="tab==='application'"/>

                  <CustomPlanSelector
                    v-else-if="tab==='selectPlan'"
                    :company-id="loggedInUser?.companyId"
                    :user-id="loggedInUser?.id"
                  />
                </div>
              </Transition>

              <ChangePassword />
            </section>
          </Transition>

        </div>
      </div>
    </div>
  </PatternSection>
</template>



<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { userLogout, useAuthCookie } from '~/composables/useAuth'
import { useAppAdmin } from '@/composables/useAppAdmin'
import { useCompanyAdmin } from '@/composables/useCompanyAdmin'
import Cookies from 'js-cookie'
import ProviderNetwork from '~/components/AppAdmin/ProviderNetwork.vue'

// Data & State
const loggedInUser = ref(null)
const editing = ref(false)
// Custom-company employees get a "Select Plan" tab to pick from the plans
// an app admin authored for their company.
const tabs = computed(() => {
  const base = [{ key: 'application', label: 'Application' }]
  if (company.value?.enrollmentType === 'custom') {
    base.unshift({ key: 'selectPlan', label: 'Select Plan' })
  }
  return base
})

const tab = ref('application')
const tabRefs = ref<HTMLLIElement[]>([])
const underlineX = ref(0)
const underlineWidth = ref(0)

const photos = ref([])
const loadingPhotos = ref(false)
const errorPhotos = ref(null)


const company = ref(null)
const loadingCompany = ref(false)
const errorCompany = ref(null)

const userId = loggedInUser.value?.id // e.g. from auth store/session
const isAppAdmin = ref(false)
const isCompanyAdmin = ref(false)



const selectedEmployee = ref<number | null>(null)


// Get the reactive auth cookie
const authCookie = useAuthCookie()

// Watch for changes to the auth cookie and re-fetch user data
watch(
  () => authCookie.value,
  (newVal, oldVal) => {
    if (newVal) {
      getLoggedInUser().then(data => {
        loggedInUser.value = data
      })
    }
  }
)

// Methods
async function fetchCompanyInfo(companyId: number) {
  try {
    loadingCompany.value = true
    const response = await $fetch(`/api/company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
      },
    })
    if (response.error) throw new Error(response.error)
    company.value = response.company
    
    // Populate loggedInUser fields for display safely
    if (company.value && loggedInUser.value) {
      loggedInUser.value = {
        ...loggedInUser.value,
        companyName: company.value.companyName,
        ein: company.value.ein,
        industry: company.value.industry,
        streetAddress: company.value.streetAddress,
        city: company.value.city,
        state: company.value.state,
        zipCode: company.value.zipCode,
        companyPhone: company.value.phoneNumber,
        companyEmail: company.value.companyEmail,
        website: company.value.website,
        employeeSize: company.value.employeeSize,
        businessCode: company.value.businessCode,
      }
    }




  } catch (err: any) {
    console.error('Error fetching company:', err)
    errorCompany.value = err.message || 'Failed to fetch company info'
  } finally {
    loadingCompany.value = false
  }
}



async function getLoggedInUser() {
  try {
    if (!authCookie.value) {
      console.error("Auth cookie is missing.");
      return null;
    }
    const response = await $fetch(`/api/user`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    });
    return response.user || response;
  } catch (error) {
    console.error("Error in getLoggedInUser:", error.message || error);
    return null;
  }
}



async function fetchPhotos() {
  try {
    loadingPhotos.value = true
    if (!authCookie.value) throw new Error('Authentication token is missing.')
    const response = await $fetch('/api/user/photos', {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    photos.value = response.photos || []
  } catch (error) {
    console.error('Error fetching photos:', error)
    errorPhotos.value = 'Failed to load photos. Please try again.'
  } finally {
    loadingPhotos.value = false
  }
}



async function updateLoggedInUser() {
  try {
    const token = Cookies.get('auth_token')
    if (!token) throw new Error('Authentication token is missing.')
    await $fetch('/api/user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: loggedInUser.value,
    })
    alert('Profile updated successfully!')
    editing.value = false
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Failed to update profile. Please try again.')
  }
}

function editProfile() {
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function setTab(tabName: string) {
  tab.value = tabName
  moveUnderline()
}

function moveUnderline() {
  nextTick(() => {
    const index = tabs.value.findIndex(t => t.key === tab.value)
    const el = tabRefs.value[index]
    if (el) {
      underlineX.value = el.offsetLeft - 30  // <-- shift left by 30px
      underlineWidth.value = el.offsetWidth
    }
  })
}


async function logout() {
  await userLogout()
}

onMounted(async () => {
  moveUnderline()
  if (!authCookie.value) {
    return
  }

  loggedInUser.value = await getLoggedInUser()

  if (loggedInUser.value?.companyId) {
    await fetchCompanyInfo(loggedInUser.value.companyId)
  }

  await fetchPhotos()

  if (loggedInUser.value?.id) {
    isAppAdmin.value = await useAppAdmin(loggedInUser.value.id)

    // Correct usage: just call it once
    isCompanyAdmin.value = await useCompanyAdmin(loggedInUser.value.id)
  } else {
  }
})

watch(tab, () => moveUnderline())



interface Company { id: number; companyName: string; industry: string; }
interface Employee { id: number; firstName: string; lastName: string; userId: number; }

const selectedCompany = ref<Company | null>(null);


const onCompanySelect = (company: Company | null) => {
  selectedCompany.value = company;
  selectedEmployee.value = null;
};

const onEmployeeSelect = (emp: Employee | null) => {
  selectedEmployee.value = emp;
};

</script>


<style lang="css" scoped>
/* Sidebar slide */
.slide-aside-enter-active,
.slide-aside-leave-active {
  transition: all 0.5s ease;
}
.slide-aside-enter-from,
.slide-aside-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-aside-enter-to,
.slide-aside-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Main section grows */
.grow-section {
  transition: all 0.5s ease;
}

/* Fade + slide transition for tab content */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px); /* slide up */
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* slide up while leaving */
}



</style>