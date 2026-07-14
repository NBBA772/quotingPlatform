<template>
  <PatternSection>
    <div>
      <!-- Main Content -->
      <div class="max-w-8xl mx-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start transition-all duration-500 ease-in-out">

              <!-- Sidebar -->
          <Transition name="slide-aside">
            <aside class="md:col-span-1 transition-all duration-500 ease-in-out">
              <div class="bg-white dark:bg-[#3a4934] shadow-md rounded-lg p-4">

                <!-- Edit Form -->
                <div v-if="editing" class="mt-6">
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Edit Profile</h2>
                  <form @submit.prevent="updateLoggedInUser">
                    <div class="space-y-4">
                      <div>
                        <label for="firstName" class="block text-gray-700 dark:text-gray-300">First Name:</label>
                        <input id="firstName" v-model="loggedInUser.firstName" type="text" class="w-full bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                      <div>
                        <label for="lastName" class="block text-gray-700 dark:text-gray-300">Last Name:</label>
                        <input id="lastName" v-model="loggedInUser.lastName" type="text" class="w-full bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                      <div>
                        <label for="email" class="block text-gray-700 dark:text-gray-300">Email:</label>
                        <input id="email" v-model="loggedInUser.email" type="email" class="w-full bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                      <div>
                        <label for="phone" class="block text-gray-700 dark:text-gray-300">Phone:</label>
                        <input id="phone" v-model="loggedInUser.phone" type="tel" class="w-full bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                      <div>
                        <label for="location" class="block text-gray-700 dark:text-gray-300">Location:</label>
                        <input id="location" v-model="loggedInUser.location" type="text" class="w-full bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"/>
                      </div>
                      <div>
                        <label for="bio" class="block text-gray-700 dark:text-gray-300">Bio:</label>
                        <textarea id="bio" v-model="loggedInUser.bio" class="w-full bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                      </div>
                    </div>
                    <div class="mt-4 flex justify-end space-x-4">
                      <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600" @click="cancelEdit">Cancel</button>
                      <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#046937]">Save Changes</button>
                    </div>
                  </form>
                </div>

                <!-- View Info -->
                <div v-else>
                  <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Intro</h2>
                  <ul class="space-y-4">
                    <li class="flex justify-between"><span class="text-gray-700 dark:text-gray-300">Email:</span> <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.email }}</span></li>
                    <li class="flex justify-between"><span class="text-gray-700 dark:text-gray-300">Phone:</span> <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.phone || 'N/A' }}</span></li>
                    <li class="flex justify-between"><span class="text-gray-700 dark:text-gray-300">Location:</span> <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.location || 'N/A' }}</span></li>
                  </ul>

                  <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 mt-6">Enrollment Info</h2>
                  <ul class="space-y-2">
                    <li class="flex justify-between"><span class="text-gray-700 dark:text-gray-300">Enrollee:</span> <span class="text-gray-800 dark:text-gray-200">{{ loggedInUser?.companyName || 'N/A' }}</span></li>
                    <li class="flex justify-between"><span class="text-gray-700 dark:text-gray-300">Enrollee Code:</span> <span class="text-gray-800 dark:text-gray-200">{{ company?.businessCode || loggedInUser?.businessCode || 'N/A' }}</span></li>
                  </ul>

                  <div class="mt-6">
                    <button class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45] w-full" @click="editProfile">Edit Details</button>
                  </div>
                </div>

              </div>
            </aside>
          </Transition>

          <!-- Section Column -->
          <Transition name="slide-aside">
            <section class="md:col-span-2 transition-all duration-500 ease-in-out">

              <!-- Tabs with animated underline -->
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

              <!-- Animated Tab Content -->
              <Transition name="fade-slide" mode="out-in">
                <div :key="tab">

                    <!-- Request SEO Tab -->
<!--                      
                    <div v-else-if="tab === 'requestSEO'" class="p-4 mt-4 bg-white dark:bg-[#3a4934] shadow rounded-lg">
                      <div class="flex items-center mb-4 space-x-4">
                        <span :class="!tabSwitch ? 'font-bold' : ''">Request SEO</span>
                       <label class="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" v-model="tabSwitch" />
                        <div
                          class="w-11 h-6 bg-gray-200 dark:bg-[#142610]
                                peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500
                                rounded-full transition-all duration-300 ease-in-out
                                peer-hover:bg-gray-300 dark:peer-hover:bg-[#1b3320]
                                peer-checked:bg-blue-600 peer-checked:dark:bg-[#046937]">
                        </div>
                        <span
                          class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md
                                transform transition-all duration-300 ease-in-out
                                peer-active:scale-95
                                peer-checked:translate-x-5 peer-checked:shadow-[0_0_6px_rgba(4,105,55,0.6)]">
                        </span>
                      </label>

                        <span :class="tabSwitch ? 'font-bold' : ''">View Requests</span>
                      </div>

                      
                      <Transition name="fade-slide" mode="out-in">
                        <component :is="tabSwitch ? 'SeoRequestsList' : 'RequestSEO'" :key="tabSwitch" />
                      </Transition>
                    </div> -->


                  <!-- Request Web Development Tab -->
                  <!-- <div v-else-if="tab === 'requestWebDevelopment'" class="p-4 mt-4 bg-white dark:bg-[#3a4934] shadow rounded-lg">
                    <div class="flex items-center mb-4 space-x-4">
                      <span :class="!tabSwitch ? 'font-bold' : ''">Request Web Development</span>
                      <label class="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer" v-model="tabSwitch" />
                        <div
                          class="w-11 h-6 bg-gray-200 dark:bg-[#142610]
                                peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500
                                rounded-full transition-all duration-300 ease-in-out
                                peer-hover:bg-gray-300 dark:peer-hover:bg-[#1b3320]
                                peer-checked:bg-blue-600 peer-checked:dark:bg-[#046937]">
                        </div>
                        <span
                          class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md
                                transform transition-all duration-300 ease-in-out
                                peer-active:scale-95
                                peer-checked:translate-x-5 peer-checked:shadow-[0_0_6px_rgba(4,105,55,0.6)]">
                        </span>
                      </label>

                      <span :class="tabSwitch ? 'font-bold' : ''">View Requests</span>
                    </div>

                    <Transition name="fade-slide" mode="out-in">
                      <component :is="tabSwitch ? 'WebDevelopmentRequestsList' : 'RequestWebDevelopment'" :key="tabSwitch" />
                    </Transition>

                  </div> -->

                  <!-- Payroll Tab -->
                  <!-- <div v-else-if="tab === 'payroll'">
                    <Payroll/>
                  </div> -->

                  <!-- Application Tab -->
                  <div v-if="tab === 'application'">
                    <Application />
                  </div>

                  <!-- Payment Tab -->
                  <div v-else-if="tab === 'payment'" class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
                    <EnrollPaymentForm v-if="myApplication?.id" :application-id="myApplication.id" />
                    <p v-else class="text-gray-500 dark:text-gray-300">
                      Save your application first — payment opens once it's on file.
                    </p>
                  </div>
                </div>
              </Transition>

            </section>
          </Transition>

        </div>
      </div>
    </div>
  </PatternSection>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'

const loggedInUser = ref<any>(null)
const myApplication = ref<any>(null)
const editing = ref(false)
const tab = ref('application')
const company = ref<any>(null)
const authCookie = useAuthCookie()
const tabSwitch = ref(false)

// Animated tabs
const tabRefs = ref<HTMLElement[]>([])
const underlineX = ref(0)
const underlineWidth = ref(0)

const tabs = [
  // { key: 'requestSEO', label: 'Request SEO' },
  // { key: 'requestWebDevelopment', label: 'Request Web Development' },
  // { key: 'payroll', label: 'Payroll' },
  { key: 'application', label: 'Application' },
  { key: 'payment', label: 'Payment' },
]

async function getLoggedInUser() {
  if (!authCookie.value) return null
  const response = await $fetch('/api/user', {
    headers: { Authorization: `Bearer ${authCookie.value}` },
  })
  return response.user || response
}

async function fetchCompanyInfo(companyId: number) {
  if (!authCookie.value || !companyId) return
  const response = await $fetch(`/api/company/${companyId}`, {
    headers: { Authorization: `Bearer ${authCookie.value}` },
  })
  company.value = response.company
  if (loggedInUser.value && company.value) {
    loggedInUser.value = { ...loggedInUser.value, ...company.value }
  }
}

async function updateLoggedInUser() {
  try {
    await $fetch('/api/user', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authCookie.value}`, 'Content-Type': 'application/json' },
      body: loggedInUser.value,
    })
    editing.value = false
    alert('Profile updated successfully!')
  } catch (err) {
    console.error(err)
    alert('Failed to update profile.')
  }
}

function editProfile() { editing.value = true }
function cancelEdit() { editing.value = false }



function setTab(tabName: string) {
  tab.value = tabName
  if (tabName === 'requestSEO' || tabName === 'requestWebDevelopment') tabSwitch.value = false
  // Pick up an application saved moments ago in the Application tab
  if (tabName === 'payment') loadMyApplication()
  nextTick(updateUnderline)
}

async function loadMyApplication() {
  try {
    const apps: any = await $fetch('/api/applications/my')
    myApplication.value = Array.isArray(apps) && apps.length ? apps[0] : null
  } catch (err) {
    console.error('Failed to load application for payment tab:', err)
  }
}

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
  if (loggedInUser.value?.companyId) {
    await fetchCompanyInfo(loggedInUser.value.companyId)
  }
  await loadMyApplication()
  nextTick(updateUnderline)
})
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
