<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <h2 class="text-xl font-bold mb-4">Company Payroll / Benefit Payments</h2>

    <div class="overflow-x-auto">
      <table class="w-full table-auto border-collapse">
        <thead>
          <tr class="bg-gray-100 dark:bg-[#142610] text-left">
            <th class="p-2 border-b">Service</th>
            <th class="p-2 border-b">Amount</th>
            <th class="p-2 border-b">Next Payment</th>
            <th class="p-2 border-b">Status</th>
            <th class="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50 dark:hover:bg-[#566051]">
            <td class="p-2 border-b">{{ payment.service }}</td>
            <td class="p-2 border-b">${{ payment.amount.toFixed(2) }}</td>
            <td class="p-2 border-b">{{ formatDate(payment.nextPayment) }}</td>
            <td class="p-2 border-b">
              <span
                :class="{
                  'text-yellow-600': payment.status === 'PENDING',
                  'text-green-600': payment.status === 'PAID',
                  'text-red-600': payment.status === 'OVERDUE'
                }"
              >
                {{ payment.status }}
              </span>
            </td>
            <td class="p-2 border-b">
              <button
                v-if="payment.status === 'PENDING'"
                @click="markPaid(payment.id)"
                class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Mark Paid
              </button>
              <span v-else class="text-gray-500">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Payment {
  id: number
  service: string
  amount: number
  nextPayment: string
  status: 'PENDING' | 'PAID' | 'OVERDUE'
}

// Hardcoded example data
const payments = ref<Payment[]>([
  { id: 1, service: 'SEO Subscription', amount: 250, nextPayment: '2025-09-15', status: 'PENDING' },
  { id: 2, service: 'Web Development', amount: 500, nextPayment: '2025-09-20', status: 'PAID' },
  { id: 3, service: 'Group Insurance', amount: 1200, nextPayment: '2025-10-01', status: 'PENDING' },
  { id: 4, service: 'Payroll Service Fee', amount: 150, nextPayment: '2025-09-25', status: 'OVERDUE' },
])

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()

const markPaid = (id: number) => {
  const payment = payments.value.find(p => p.id === id)
  if (payment) payment.status = 'PAID'
}
</script>

<style scoped>
table {
  min-width: 100%;
}
</style>
