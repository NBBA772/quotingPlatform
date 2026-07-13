<template>
  <div class="border rounded-xl p-5 dark:border-gray-600">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Payment</h3>

    <!-- Paid / recorded -->
    <div v-if="paid || payment?.alreadyPaid" class="text-center py-4">
      <div class="text-green-600 dark:text-green-400 text-4xl mb-2">✓</div>
      <template v-if="manualRecorded || (payment?.alreadyPaid && payment?.manualMode)">
        <p class="text-gray-800 dark:text-white font-semibold">Payment details recorded</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Our office will process this payment and email a receipt.
        </p>
      </template>
      <template v-else>
        <p class="text-gray-800 dark:text-white font-semibold">Payment complete</p>
        <p v-if="paidTransactionId" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Transaction #{{ paidTransactionId }} — a receipt was emailed to the applicant.
        </p>
      </template>
    </div>

    <div v-else-if="payment" class="space-y-4">
      <!-- Method tabs -->
      <div class="flex space-x-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg font-medium"
          :class="method === 'card' ? 'bg-blue-600 text-white dark:bg-[#046937]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
          @click="method = 'card'"
        >
          Credit Card
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg font-medium"
          :class="method === 'ach' ? 'bg-blue-600 text-white dark:bg-[#046937]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
          @click="method = 'ach'"
        >
          Bank Account (ACH)
        </button>
      </div>

      <!-- Amount breakdown -->
      <div class="text-sm">
        <div
          v-for="item in payment.breakdown"
          :key="item.label"
          class="flex justify-between py-1 text-gray-700 dark:text-gray-300"
        >
          <span>{{ item.label }}</span>
          <span>${{ item.amount.toFixed(2) }}{{ item.oneTime ? ' (one-time)' : '/mo' }}</span>
        </div>
        <div v-if="currentFee != null" class="flex justify-between py-1 text-gray-700 dark:text-gray-300">
          <span>{{ method === 'ach' ? 'ACH processing fee' : 'Card processing fee' }}</span>
          <span>${{ currentFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between py-2 border-t mt-1 font-semibold text-gray-800 dark:text-white dark:border-gray-600">
          <span>Total charge</span>
          <span>${{ currentTotal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Card form -->
      <div v-if="method === 'card'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Name on Card</label>
          <input v-model="card.accountHolder" type="text" autocomplete="cc-name"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Card Number</label>
          <input v-model="card.cardNumber" type="text" inputmode="numeric" autocomplete="cc-number"
                placeholder="•••• •••• •••• ••••"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Expiration</label>
          <div class="flex space-x-2">
            <select v-model="card.month" class="px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
              <option value="">MM</option>
              <option v-for="m in 12" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
            </select>
            <select v-model="card.year" class="px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
              <option value="">YYYY</option>
              <option v-for="y in expYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">CVC</label>
            <input v-model="card.cvc" type="text" inputmode="numeric" autocomplete="cc-csc" maxlength="4"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">ZIP</label>
            <input v-model="card.postalCode" type="text" inputmode="numeric" autocomplete="postal-code"
                  class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>
      </div>

      <!-- ACH form -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Account Holder</label>
          <input v-model="bank.accountHolder" type="text"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Account Type</label>
          <select v-model="bank.accountType" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
            <option value="">Select account type</option>
            <option value="PersonalChecking">Personal Checking</option>
            <option value="PersonalSavings">Personal Savings</option>
            <option value="CorporateChecking">Business Checking</option>
            <option value="CorporateSavings">Business Savings</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Routing Number</label>
          <input v-model="bank.routingNumber" type="text" inputmode="numeric" maxlength="9"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Account Number</label>
          <input v-model="bank.accountNumber" type="text" inputmode="numeric"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-400">
        <template v-if="payment.manualMode">
          Invoice {{ payment.invoice }}. Your payment details are securely recorded and
          processed by our office; the processing fee is added at that time.
        </template>
        <template v-else>
          Processed securely by ePayPolicy — invoice {{ payment.invoice }}.
          {{ method === 'ach' ? 'Bank' : 'Card' }} details are not stored.
        </template>
      </p>

      <p v-if="payError" class="text-red-600 dark:text-red-400">{{ payError }}</p>

      <div class="flex justify-end">
        <button
          type="button"
          :disabled="paying"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          @click="pay"
        >
          {{ paying ? 'Processing…' : payment.manualMode ? `Authorize $${currentTotal.toFixed(2)}/mo` : `Pay $${currentTotal.toFixed(2)}` }}
        </button>
      </div>
    </div>

    <p v-else-if="paymentError" class="text-sm text-gray-500 dark:text-gray-400">
      {{ paymentError }}
    </p>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">Loading payment details…</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useCookie } from '#imports'

const props = defineProps<{ applicationId: number }>()
const emit = defineEmits<{ (e: 'paid', transactionId: number | null): void }>()

const payment = ref<{
  amount: number
  breakdown: { label: string; amount: number; oneTime?: boolean }[]
  creditCardPayerFee: number | null
  achPayerFee: number | null
  cardTotal: number
  achTotal: number
  invoice: string
  alreadyPaid: boolean
  manualMode: boolean
} | null>(null)
const paymentError = ref('')
const manualRecorded = ref(false)

const method = ref<'card' | 'ach'>('card')

const card = reactive({
  accountHolder: '',
  cardNumber: '',
  cvc: '',
  month: '' as string | number,
  year: '' as string | number,
  postalCode: '',
})

const bank = reactive({
  accountHolder: '',
  accountType: '',
  routingNumber: '',
  accountNumber: '',
})

const paying = ref(false)
const payError = ref('')
const paid = ref(false)
const paidTransactionId = ref<number | null>(null)

const currentYear = new Date().getFullYear()
const expYears = Array.from({ length: 15 }, (_, i) => currentYear + i)

const currentFee = computed(() =>
  method.value === 'ach' ? payment.value?.achPayerFee ?? null : payment.value?.creditCardPayerFee ?? null,
)
const currentTotal = computed(() =>
  (method.value === 'ach' ? payment.value?.achTotal : payment.value?.cardTotal) ?? payment.value?.amount ?? 0,
)

function authHeaders() {
  const authToken = useCookie('auth_token').value
  return authToken ? { Authorization: `Bearer ${authToken}` } : {}
}

onMounted(async () => {
  try {
    payment.value = await $fetch(`/api/applications/${props.applicationId}/payment-info`, {
      headers: authHeaders(),
    })
  } catch (err: any) {
    paymentError.value = err?.data?.statusMessage || 'Payment details unavailable.'
  }
})

async function pay() {
  payError.value = ''

  const body: Record<string, any> = { method: method.value }
  if (method.value === 'card') {
    if (!card.accountHolder.trim() || !card.cardNumber.trim() || !card.cvc.trim() || !card.month || !card.year) {
      payError.value = 'Fill in all card fields.'
      return
    }
    body.card = { ...card }
  } else {
    if (!bank.accountHolder.trim() || !bank.accountType || !bank.routingNumber.trim() || !bank.accountNumber.trim()) {
      payError.value = 'Fill in all bank account fields.'
      return
    }
    if (!/^\d{9}$/.test(bank.routingNumber.trim())) {
      payError.value = 'Routing number must be 9 digits.'
      return
    }
    body.bank = { ...bank }
  }

  paying.value = true
  try {
    const res: any = await $fetch(`/api/applications/${props.applicationId}/pay`, {
      method: 'POST',
      headers: authHeaders(),
      body,
    })
    paid.value = true
    manualRecorded.value = !!res.manual
    paidTransactionId.value = res.transactionId ?? null
    emit('paid', res.transactionId ?? null)
    // clear payment details from memory as soon as the charge succeeds
    Object.assign(card, { accountHolder: '', cardNumber: '', cvc: '', month: '', year: '', postalCode: '' })
    Object.assign(bank, { accountHolder: '', accountType: '', routingNumber: '', accountNumber: '' })
  } catch (err: any) {
    payError.value = err?.data?.statusMessage || err?.message || 'Payment failed'
  } finally {
    paying.value = false
  }
}
</script>
