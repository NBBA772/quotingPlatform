<template>
  <div class="space-y-6">
    <!-- Aggregate numbers -->
    <div v-if="loadingMetrics" class="text-gray-500 dark:text-gray-300">Loading numbers…</div>
    <div v-else-if="metrics" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Downline Agents</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ metrics.agents }}</p>
      </div>
      <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Enrollees</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ metrics.enrollees }}</p>
      </div>
      <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Signed</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-green-400">{{ metrics.applications.signed }}</p>
      </div>
      <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Paid</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ metrics.applications.paid }}</p>
      </div>
      <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Monthly Book</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ metrics.monthlyBook.toFixed(0) }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">/mo across signed</p>
      </div>
      <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Collected This Month</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ metrics.paidThisMonth.total.toFixed(0) }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ metrics.paidThisMonth.count }} payment{{ metrics.paidThisMonth.count === 1 ? '' : 's' }}</p>
      </div>
    </div>

    <!-- Downline -->
    <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Downline</h2>

      <div v-if="loadingDownline" class="text-gray-500 dark:text-gray-300">Loading downline…</div>
      <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>
      <div v-else-if="downline.length === 0" class="text-gray-500 dark:text-gray-300">
        No agents are assigned to you yet.
      </div>

      <div v-else class="space-y-3">
        <div v-for="agent in downline" :key="agent.id" class="border rounded-xl dark:border-gray-600">
          <button type="button" class="w-full flex items-center justify-between p-4 text-left" @click="toggle(agent.id)">
            <div>
              <p class="font-semibold text-gray-800 dark:text-white">
                {{ agent.name }}
                <span
                  class="ml-2 text-xs px-2 py-0.5 rounded-full"
                  :class="agent.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'"
                >{{ agent.isAvailable ? 'Available' : 'Offline' }}</span>
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ agent.email }}</p>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-600 dark:text-gray-300">{{ agent.enrollees }} enrollee{{ agent.enrollees === 1 ? '' : 's' }}</span>
              <span class="text-blue-600 dark:text-green-400">{{ agent.signed }} signed</span>
              <span class="text-green-600 dark:text-green-400">{{ agent.paid }} paid</span>
              <span class="text-gray-400">{{ expanded.has(agent.id) ? '▲' : '▼' }}</span>
            </div>
          </button>

          <div v-if="expanded.has(agent.id)" class="border-t dark:border-gray-600 px-4 pb-3">
            <div v-if="agent.employees.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-3">
              No enrollees yet.
            </div>
            <table v-else class="w-full text-left text-sm mt-2">
              <thead>
                <tr class="text-gray-400 dark:text-gray-500">
                  <th class="py-1 font-medium">Enrollee</th>
                  <th class="py-1 font-medium">Company</th>
                  <th class="py-1 font-medium">Type</th>
                  <th class="py-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in agent.employees" :key="e.id" class="border-t dark:border-gray-700">
                  <td class="py-1.5 dark:text-white">{{ e.name }}<div class="text-xs text-gray-400">{{ e.email }}</div></td>
                  <td class="py-1.5 dark:text-gray-300">{{ e.company }}</td>
                  <td class="py-1.5 dark:text-gray-300 capitalize">{{ e.enrollmentType }}</td>
                  <td class="py-1.5">
                    <span v-if="e.paid" class="text-green-600 dark:text-green-400 font-semibold">Paid</span>
                    <span v-else-if="e.signed" class="text-blue-600 dark:text-green-400 font-semibold">Signed</span>
                    <span v-else class="text-gray-500 dark:text-gray-400">In progress</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'

const authCookie = useAuthCookie()
const authHeaders = () => (authCookie.value ? { Authorization: `Bearer ${authCookie.value}` } : {})

const metrics = ref<any>(null)
const loadingMetrics = ref(true)
const downline = ref<any[]>([])
const loadingDownline = ref(true)
const error = ref('')

const expanded = ref<Set<number>>(new Set())
const toggle = (id: number) => {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

onMounted(async () => {
  try {
    const [m, d] = await Promise.all([
      $fetch('/api/agent-admin/metrics', { headers: authHeaders() }),
      $fetch('/api/agent-admin/downline', { headers: authHeaders() }),
    ])
    metrics.value = m
    downline.value = (d as any).downline || []
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load team'
  } finally {
    loadingMetrics.value = false
    loadingDownline.value = false
  }
})
</script>
