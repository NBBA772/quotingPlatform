<template>
  <div class="mb-6">
    <div v-if="loading" class="text-gray-500 dark:text-gray-300 p-4">Loading metrics…</div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400 p-4">{{ error }}</div>

    <template v-else-if="m">
      <!-- Stat cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">Enrollees</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ m.clients }}</p>
        </div>
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">Signed</p>
          <p class="text-2xl font-bold text-blue-600 dark:text-green-400">{{ m.applications.signed }}</p>
        </div>
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">Paid</p>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ m.applications.paid }}</p>
        </div>
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
          <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ m.applications.inProgress }}</p>
        </div>
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">Monthly Book</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ m.monthlyBook.toFixed(0) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">/mo across signed</p>
        </div>
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4">
          <p class="text-xs text-gray-500 dark:text-gray-400">Collected This Month</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ m.paidThisMonth.total.toFixed(0) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ m.paidThisMonth.count }} payment{{ m.paidThisMonth.count === 1 ? '' : 's' }}</p>
        </div>
      </div>

      <!-- Needs attention -->
      <div
        v-if="m.attention.declined.length || m.attention.signedUnpaid.length || m.attention.notStarted.length"
        class="bg-white dark:bg-[#3a4934] rounded-xl shadow-md p-4"
      >
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Needs Attention</h3>
        <ul class="space-y-2 text-sm">
          <li
            v-for="d in m.attention.declined"
            :key="`dec-${d.userId}-${d.createdAt}`"
            class="flex items-center justify-between border-l-4 border-red-500 pl-3 py-1"
          >
            <span class="text-gray-700 dark:text-gray-300">
              <b>{{ d.name }}</b> — payment of ${{ d.amount.toFixed(2) }} declined
              <span v-if="d.message" class="text-gray-500 dark:text-gray-400">({{ d.message }})</span>
            </span>
            <NuxtLink :to="`/enroll/${d.userId}/sign`" class="text-blue-600 dark:text-green-400 hover:underline ml-4">
              Retry
            </NuxtLink>
          </li>
          <li
            v-for="s in m.attention.signedUnpaid"
            :key="`unpaid-${s.userId}`"
            class="flex items-center justify-between border-l-4 border-yellow-500 pl-3 py-1"
          >
            <span class="text-gray-700 dark:text-gray-300">
              <b>{{ s.name }}</b> — signed but hasn't paid (${{ s.amount.toFixed(2) }}/mo)
            </span>
            <NuxtLink :to="`/enroll/${s.userId}/sign`" class="text-blue-600 dark:text-green-400 hover:underline ml-4">
              Collect
            </NuxtLink>
          </li>
          <li
            v-for="n in m.attention.notStarted"
            :key="`new-${n.userId}`"
            class="flex items-center justify-between border-l-4 border-blue-500 pl-3 py-1"
          >
            <span class="text-gray-700 dark:text-gray-300">
              <b>{{ n.name }}</b> — no application started
            </span>
            <NuxtLink :to="`/enroll/${n.userId}/applicant`" class="text-blue-600 dark:text-green-400 hover:underline ml-4">
              Enroll
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCookie } from '#imports'

const m = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const authToken = useCookie('auth_token').value
    m.value = await $fetch('/api/insurance-agent/me/metrics', {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    })
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load metrics'
  } finally {
    loading.value = false
  }
})
</script>
