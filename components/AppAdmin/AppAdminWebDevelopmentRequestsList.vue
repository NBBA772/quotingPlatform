<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">

    <!-- Company Dropdown -->
    <CompanyEmployeeDropdown @update:selectedCompany="onCompanySelect" :companyOnly="true" />

    <h2 class="text-xl font-bold mb-4">Web Development Requests</h2>

    <!-- Message before company selection -->
    <div v-if="!selectedCompany" class="text-gray-500 dark:text-gray-400">
      Please select a company to view web development requests.
    </div>

    <!-- Skeleton loader while fetching -->
    <AppAdminWebDevRequestsSkeleton v-else-if="loading" />

    <!-- No requests found -->
    <div v-else-if="requests.length === 0" class="text-gray-500 dark:text-gray-300">
      No web development requests found.
    </div>

    <!-- Requests table -->
    <table v-else class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610] text-left">
          <th class="p-2 border-b">Project Name</th>
          <th class="p-2 border-b">Description</th>
          <th class="p-2 border-b">Status</th>
          <th class="p-2 border-b">Requested At</th>
          <th class="p-2 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="request in requests"
          :key="request.id"
          class="hover:bg-gray-50 dark:hover:bg-[#566051]"
        >
          <td class="p-2 border-b break-words">{{ request.projectName }}</td>
          <td class="p-2 border-b break-words">{{ request.description || '-' }}</td>
          <td class="p-2 border-b">
            <span
              :class="{
                'text-yellow-600': request.status === 'PENDING',
                'text-blue-600': request.status === 'IN_PROGRESS',
                'text-green-600': request.status === 'COMPLETED'
              }"
            >
              {{ request.status }}
            </span>
          </td>
          <td class="p-2 border-b">{{ formatDate(request.requestedAt) }}</td>
          <td class="p-2 border-b">
            <button
              v-if="request.status === 'PENDING'"
              @click="markCompleted(request.id)"
              class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Mark Completed
            </button>
            <span v-else class="text-gray-500">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'
import CompanyEmployeeDropdown from '~/components/AppAdmin/CompanyEmployeeDropdown.vue'

interface WebDevRequest {
  id: number
  projectName: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  requestedAt: string
}

const authCookie = useAuthCookie()
const requests = ref<WebDevRequest[]>([])
const loading = ref(true)
const selectedCompany = ref<{ id: number } | null>(null)

const fetchRequests = async () => {
  if (!selectedCompany.value?.id) {
    requests.value = []
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res: any = await $fetch(`/api/admin/web-development-request?companyId=${selectedCompany.value.id}`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    requests.value = res.requests || []
  } catch (err: any) {
    console.error('Failed to fetch web development requests', err)
    requests.value = []
  } finally {
    loading.value = false
  }
}

const markCompleted = async (id: number) => {
  if (!selectedCompany.value?.id) return
  try {
    await $fetch(`/api/admin/web-development-request/${id}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authCookie.value}` },
      body: { companyId: selectedCompany.value.id },
    })
    const request = requests.value.find(r => r.id === id)
    if (request) request.status = 'COMPLETED'
  } catch (err: any) {
    console.error('Failed to mark completed', err)
    alert('Failed to mark as completed.')
  }
}

const onCompanySelect = (company: { id: number }) => {
  selectedCompany.value = company
  fetchRequests()
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()
</script>

<style scoped>
table {
  min-width: 100%;
}
</style>
