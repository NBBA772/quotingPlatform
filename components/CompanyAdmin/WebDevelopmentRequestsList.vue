<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Web Development Requests</h2>

    <!-- Skeleton only when actively loading -->
    <CompanyAdminWebDevRequestsSkeleton v-if="loading" :rows="6" />

    <!-- No company selected -->
    <div
      v-else-if="errorMessage === 'NO_COMPANY'"
      class="text-red-500 dark:text-red-400"
    >
      You must belong to a company to view web development requests.
    </div>

    <!-- Empty state after load -->
    <div
      v-else-if="requests.length === 0"
      class="text-gray-500 dark:text-gray-300"
    >
      No web development requests found.
    </div>

    <!-- Table only when we have data -->
    <table v-else class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610] text-left">
          <th class="p-2 border-b">Project Name</th>
          <th class="p-2 border-b">Description</th>
          <th class="p-2 border-b">Status</th>
          <th class="p-2 border-b">Requested At</th>
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
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'

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
const errorMessage = ref<string | null>(null)

const fetchRequests = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const res = await $fetch('/api/company/web-development-request', {
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
      },
    })
    requests.value = Array.isArray(res?.requests) ? res.requests : []
  } catch (err: any) {
    console.error('Failed to fetch web development requests', err)

    if (err?.statusCode === 403) {
      errorMessage.value = 'NO_COMPANY'
    } else {
      errorMessage.value = 'UNKNOWN'
    }

    requests.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()

onMounted(() => {
  fetchRequests()
})
</script>
