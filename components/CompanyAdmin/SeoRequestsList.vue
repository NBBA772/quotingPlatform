<template>
  <div>
    <h2 class="text-xl font-bold mb-4">SEO Requests</h2>

    <SeoRequestsSkeleton v-if="loading" :rows="6" />


    <div v-else-if="requests.length === 0" class="text-gray-500 dark:text-gray-300">
      No SEO requests found.
    </div>

    <table v-else class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610] text-left">
          <th class="p-2 border-b">Page URL</th>
          <th class="p-2 border-b">Description</th>
          <th class="p-2 border-b">Status</th>
          <th class="p-2 border-b">Requested At</th>
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
                'text-red-600': request.status === 'REJECTED'
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

interface SeoRequest {
  id: number
  pageUrl: string
  description: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

const authCookie = useAuthCookie()
const requests = ref<SeoRequest[]>([])
const loading = ref(true)

const fetchRequests = async () => {
  loading.value = true
  try {
    const res = await $fetch('/api/company/seo-requests', {
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
      },
    })
    // $fetch returns data directly
    requests.value = res.requests
  } catch (err: any) {
    console.error('Failed to fetch SEO requests', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()

onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
table {
  min-width: 100%;
}
</style>
