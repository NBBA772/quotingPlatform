<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934] space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold dark:text-white">Payments</h2>
      <button
        type="button"
        class="text-sm text-blue-600 dark:text-green-400 hover:underline"
        :disabled="loading"
        @click="load"
      >
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading && !data" class="text-gray-500 dark:text-gray-300">Loading…</div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>

    <template v-else-if="data">
      <!-- Stat cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="border rounded-xl p-4 dark:border-gray-600">
          <p class="text-sm text-gray-500 dark:text-gray-400">Paid this week</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ data.paidThisWeek.total.toFixed(2) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ data.paidThisWeek.count }} payment{{ data.paidThisWeek.count === 1 ? '' : 's' }}</p>
        </div>
        <div class="border rounded-xl p-4 dark:border-gray-600">
          <p class="text-sm text-gray-500 dark:text-gray-400">Paid this month</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">${{ data.paidThisMonth.total.toFixed(2) }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ data.paidThisMonth.count }} payment{{ data.paidThisMonth.count === 1 ? '' : 's' }}</p>
        </div>
        <div class="border rounded-xl p-4 dark:border-gray-600">
          <p class="text-sm text-gray-500 dark:text-gray-400">Declined (recent)</p>
          <p class="text-2xl font-bold" :class="data.declinedCount ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'">
            {{ data.declinedCount }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">last 25 shown below</p>
        </div>
        <div class="border rounded-xl p-4 dark:border-gray-600">
          <p class="text-sm text-gray-500 dark:text-gray-400">Applications</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ data.totalApplications }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            <span v-for="(count, status, i) in data.funnel" :key="status">{{ i > 0 ? ' · ' : '' }}{{ statusLabel(status) }}: {{ count }}</span>
          </p>
        </div>
      </div>

      <!-- Pending manual processing -->
      <div v-if="data.pendingManual?.length">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          To Process Manually
          <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            {{ data.pendingManual.length }}
          </span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Clients authorized these payments; download the PDF, run the charge in ePayPolicy, then mark paid.
        </p>
        <table class="w-full text-left text-sm border dark:border-gray-600 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 dark:bg-[#243021]">
            <tr>
              <th class="p-2 dark:text-white">Authorized</th>
              <th class="p-2 dark:text-white">Applicant</th>
              <th class="p-2 dark:text-white">Group</th>
              <th class="p-2 dark:text-white">Amount</th>
              <th class="p-2 dark:text-white">Method</th>
              <th class="p-2 dark:text-white">Invoice</th>
              <th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedManual" :key="row.id" class="border-t dark:border-gray-600">
              <td class="p-2 dark:text-white">{{ formatDate(row.createdAt) }}</td>
              <td class="p-2 dark:text-white">{{ row.applicant }}</td>
              <td class="p-2 dark:text-white">{{ row.group }}</td>
              <td class="p-2 dark:text-white">${{ row.amount.toFixed(2) }}</td>
              <td class="p-2 dark:text-white">{{ row.method === 'ach' ? 'ACH' : 'Card' }}</td>
              <td class="p-2 dark:text-white">{{ row.invoice }}</td>
              <td class="p-2 text-right whitespace-nowrap">
                <button
                  v-if="row.hasPdf"
                  type="button"
                  class="text-blue-600 dark:text-green-400 hover:underline mr-3"
                  @click="openPaymentPdf(row.id)"
                >
                  PDF
                </button>
                <button
                  type="button"
                  class="text-green-600 dark:text-green-400 hover:underline"
                  :disabled="markingPaid === row.id"
                  @click="markPaid(row.id)"
                >
                  {{ markingPaid === row.id ? 'Saving…' : 'Mark Paid' }}
                </button>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800 ml-3 align-middle"
                  title="Delete payment permanently"
                  @click="permanentDeletePayment(row.id)"
                >
                  <Icon name="mdi:delete-forever" size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar :total="data.pendingManual.length" :page="pageManual" :page-size="pageSize" @update:page="pageManual = $event" />
      </div>

      <!-- Upcoming payments -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Upcoming Payments</h3>
        <p v-if="!data.upcoming.length" class="text-sm text-gray-500 dark:text-gray-400">No active enrollments with premiums yet.</p>
        <table v-else class="w-full text-left text-sm border dark:border-gray-600 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 dark:bg-[#243021]">
            <tr>
              <th class="p-2 dark:text-white">Applicant</th>
              <th class="p-2 dark:text-white">Group</th>
              <th class="p-2 dark:text-white">Monthly</th>
              <th class="p-2 dark:text-white">Last Paid</th>
              <th class="p-2 dark:text-white">Next Due</th>
              <th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedUpcoming" :key="row.applicationId" class="border-t dark:border-gray-600">
              <td class="p-2 dark:text-white">{{ row.applicant }}</td>
              <td class="p-2 dark:text-white">{{ row.group }}</td>
              <td class="p-2 dark:text-white">${{ row.amount.toFixed(2) }}</td>
              <td class="p-2 dark:text-white">{{ row.lastPaidAt ? formatDate(row.lastPaidAt) : 'Never' }}</td>
              <td class="p-2" :class="row.overdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'dark:text-white'">
                {{ formatDate(row.nextDueDate) }}{{ row.overdue ? ' (due)' : '' }}
              </td>
              <td class="p-2 text-right">
                <NuxtLink :to="`/enroll/${row.userId}/sign`" class="text-blue-600 dark:text-green-400 hover:underline">
                  Collect
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar :total="data.upcoming.length" :page="pageUpcoming" :page-size="pageSize" @update:page="pageUpcoming = $event" />
      </div>

      <!-- Declined -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Declined Payments</h3>
        <p v-if="!data.declined.length" class="text-sm text-gray-500 dark:text-gray-400">No declined payments. 🎉</p>
        <table v-else class="w-full text-left text-sm border dark:border-gray-600 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 dark:bg-[#243021]">
            <tr>
              <th class="p-2 dark:text-white">When</th>
              <th class="p-2 dark:text-white">Applicant</th>
              <th class="p-2 dark:text-white">Amount</th>
              <th class="p-2 dark:text-white">Method</th>
              <th class="p-2 dark:text-white">Reason</th>
              <th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedDeclined" :key="row.id" class="border-t dark:border-gray-600">
              <td class="p-2 dark:text-white">{{ formatDate(row.createdAt) }}</td>
              <td class="p-2 dark:text-white">{{ row.applicant }}</td>
              <td class="p-2 dark:text-white">${{ row.amount.toFixed(2) }}</td>
              <td class="p-2 dark:text-white">{{ row.method === 'ach' ? 'ACH' : 'Card' }}</td>
              <td class="p-2 text-red-600 dark:text-red-400">{{ row.message || '—' }}</td>
              <td class="p-2 text-right">
                <NuxtLink
                  v-if="row.canRetry"
                  :to="`/enroll/${row.userId}/sign`"
                  class="text-blue-600 dark:text-green-400 hover:underline"
                >
                  Retry
                </NuxtLink>
                <span v-else class="text-green-600 dark:text-green-400 text-xs">Paid since</span>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800 ml-3 align-middle"
                  title="Delete payment permanently"
                  @click="permanentDeletePayment(row.id)"
                >
                  <Icon name="mdi:delete-forever" size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar :total="data.declined.length" :page="pageDeclined" :page-size="pageSize" @update:page="pageDeclined = $event" />
      </div>

      <!-- Recent applications -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Recent Applications</h3>
        <table class="w-full text-left text-sm border dark:border-gray-600 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 dark:bg-[#243021]">
            <tr>
              <th class="p-2 dark:text-white">Submitted</th>
              <th class="p-2 dark:text-white">Applicant</th>
              <th class="p-2 dark:text-white">Group</th>
              <th class="p-2 dark:text-white">Monthly</th>
              <th class="p-2 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRecent" :key="row.applicationId" class="border-t dark:border-gray-600">
              <td class="p-2 dark:text-white">{{ formatDate(row.createdAt) }}</td>
              <td class="p-2 dark:text-white">{{ row.applicant }}</td>
              <td class="p-2 dark:text-white">{{ row.group }}</td>
              <td class="p-2 dark:text-white">{{ row.amount ? `$${row.amount.toFixed(2)}` : '—' }}</td>
              <td class="p-2">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusClass(row.status)">
                  {{ statusLabel(row.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationBar :total="data.recentApplications.length" :page="pageRecent" :page-size="pageSize" @update:page="pageRecent = $event" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCookie } from '#imports'

const data = ref<any>(null)
const loading = ref(false)
const error = ref('')

// Client-side pagination for each payments table
const pageSize = 10
const pageManual = ref(1)
const pageUpcoming = ref(1)
const pageDeclined = ref(1)
const pageRecent = ref(1)
const pageSlice = (arr: any[] | undefined, page: number) =>
  (arr || []).slice((page - 1) * pageSize, page * pageSize)
const pagedManual = computed(() => pageSlice(data.value?.pendingManual, pageManual.value))
const pagedUpcoming = computed(() => pageSlice(data.value?.upcoming, pageUpcoming.value))
const pagedDeclined = computed(() => pageSlice(data.value?.declined, pageDeclined.value))
const pagedRecent = computed(() => pageSlice(data.value?.recentApplications, pageRecent.value))
// Reset to page 1 whenever the data reloads.
watch(data, () => {
  pageManual.value = 1
  pageUpcoming.value = 1
  pageDeclined.value = 1
  pageRecent.value = 1
})

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  underwriting_complete: 'Underwriting Done',
  pdf_generated: 'PDF Ready',
  signed: 'Signed',
  paid: 'Paid',
}

function statusLabel(status: string) {
  return statusLabels[status] || status
}

function statusClass(status: string) {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    case 'signed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    case 'pdf_generated': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const markingPaid = ref<number | null>(null)

function adminHeaders() {
  const authToken = useCookie('auth_token').value
  return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

async function openPaymentPdf(paymentId: number) {
  try {
    const res: any = await $fetch(`/api/admin/payments/${paymentId}/pdf`, { headers: adminHeaders() })
    window.open(res.url, '_blank')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to open PDF'
  }
}

async function markPaid(paymentId: number) {
  const transactionId = window.prompt('ePayPolicy transaction # (optional):') || undefined
  markingPaid.value = paymentId
  try {
    await $fetch(`/api/admin/payments/${paymentId}/mark-paid`, {
      method: 'POST',
      headers: adminHeaders(),
      body: { transactionId },
    })
    await load()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to mark paid'
  } finally {
    markingPaid.value = null
  }
}

async function permanentDeletePayment(paymentId: number) {
  if (!confirm('PERMANENTLY delete this payment record? This cannot be undone.')) return
  try {
    await $fetch(`/api/admin/payments/${paymentId}/permanent`, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
    await load()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Failed to delete payment'
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const authToken = useCookie('auth_token').value
    data.value = await $fetch('/api/admin/payments-dashboard', {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    })
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load payments dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
