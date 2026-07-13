<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">

    <!-- Company Dropdown -->
    <CompanyEmployeeDropdown
      @update:selectedCompany="onCompanySelect"
      companyOnly="true"
    />

    <h2 class="text-xl font-bold mb-4">SEO Requests (Admin)</h2>

    <!-- Message before company selection -->
    <div v-if="!selectedCompany" class="text-gray-500 dark:text-gray-400">
      Please select a company to view SEO requests.
    </div>

    <!-- Skeleton Loader while fetching -->
    <AppAdminSeoRequestsSkeleton v-else-if="loading" />

    <!-- No requests found -->
    <div v-else-if="requests.length === 0" class="text-gray-500 dark:text-gray-300">
      No SEO requests found.
    </div>

    <!-- Requests table -->
    <table v-else class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610] text-left">
          <th class="p-2 border-b">Page URL</th>
          <th class="p-2 border-b">Description</th>
          <th class="p-2 border-b">Status</th>
          <th class="p-2 border-b">Requested At</th>
          <th class="p-2 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in requests" :key="request.id" class="hover:bg-gray-50 dark:hover:bg-[#566051]">
          <td class="p-2 border-b break-words">
            <a :href="request.pageUrl" target="_blank" class="text-blue-500 hover:underline">
              {{ request.pageUrl }}
            </a>
          </td>
          <td class="p-2 border-b break-words">{{ request.description || '-' }}</td>
          <td class="p-2 border-b">
            <span
              :class="{
                'text-yellow-600': request.status === 'PENDING',
                'text-green-600': request.status === 'APPROVED',
                'text-red-600': request.status === 'REJECTED',
                'text-gray-500': request.status === 'COMPLETED'
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

interface SeoRequest {
  id: number
  pageUrl: string
  description: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  requestedAt: string
}

const authCookie = useAuthCookie()
const requests = ref<SeoRequest[]>([])
const loading = ref(false)
const selectedCompany = ref<{ id: number } | null>(null)

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()

const fetchRequests = async () => {
  if (!selectedCompany.value?.id) return
  loading.value = true
  try {
    const res: any = await $fetch(`/api/admin/seo-requests?companyId=${selectedCompany.value.id}`, {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    })
    requests.value = res.requests
  } catch (err: any) {
    console.error('Failed to fetch SEO requests', err)
    requests.value = []
  } finally {
    loading.value = false
  }
}

const markCompleted = async (id: number) => {
  if (!selectedCompany.value?.id) return
  try {
    await $fetch(`/api/admin/seo-requests/${id}/complete`, {
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

// Handle company selection from dropdown
const onCompanySelect = (company: { id: number }) => {
  selectedCompany.value = company
  fetchRequests()
}
</script>

<style scoped>
table {
  min-width: 100%;
}
</style>
