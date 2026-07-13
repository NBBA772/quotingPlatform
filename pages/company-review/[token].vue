<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md my-8">
    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>

    <div v-else-if="loadError" class="text-center py-8">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">Link not found</h2>
      <p class="text-gray-600 dark:text-gray-300">{{ loadError }}</p>
    </div>

    <!-- Signed state -->
    <div v-else-if="signed" class="text-center py-8">
      <div class="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
      <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">Agreement Signed</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Thank you{{ agreement?.contact?.firstName ? ', ' + agreement.contact.firstName : '' }} —
        your agent has been notified and a copy is on file.
      </p>
      <a
        v-if="downloadUrl"
        :href="downloadUrl"
        target="_blank"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
      >
        Download Signed Copy
      </a>
    </div>

    <template v-else>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        Review & Sign — {{ agreement.company.companyName }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-300 mb-6">
        Prepared by {{ agreement.agentName || 'your insurance agent' }}.
        Please check everything below, then sign at the bottom.
      </p>

      <!-- Company details -->
      <div class="border rounded-xl p-5 mb-6 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Company Information</h3>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div v-for="row in companyRows" :key="row.label" class="flex justify-between md:block">
            <dt class="text-gray-500 dark:text-gray-400">{{ row.label }}</dt>
            <dd class="text-gray-800 dark:text-white font-medium">{{ row.value || '—' }}</dd>
          </div>
        </dl>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Something incorrect? Contact your agent before signing.
        </p>
      </div>

      <!-- PDF preview -->
      <div v-if="agreement.previewUrl" class="border rounded-xl p-5 mb-6 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Agreement Document</h3>
        <iframe :src="agreement.previewUrl" class="w-full h-96 border rounded-md dark:border-gray-600"></iframe>
      </div>

      <!-- Signing -->
      <div class="border rounded-xl p-5 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sign</h3>

        <div class="flex space-x-2 mb-5">
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium"
            :class="method === 'signature' ? 'bg-blue-600 text-white dark:bg-[#046937]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            @click="method = 'signature'"
          >
            Draw Signature
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium"
            :class="method === 'code' ? 'bg-blue-600 text-white dark:bg-[#046937]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            @click="method = 'code'"
          >
            Use 6-Digit Code
          </button>
        </div>

        <div v-if="method === 'signature'">
          <SignaturePad
            ref="sigPad"
            class="w-full h-40 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#3a3a3a]"
          />
          <button type="button" class="text-sm text-gray-500 hover:text-gray-700 mt-2" @click="clearSignature">
            Clear
          </button>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center space-x-3">
            <select v-model="codeChannel" class="px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white">
              <option value="email">Email code to {{ agreement.contact.emailMasked }}</option>
              <option v-if="agreement.contact.phoneMasked" value="sms">
                Text code to {{ agreement.contact.phoneMasked }}
              </option>
            </select>
            <button
              type="button"
              :disabled="sendingCode"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
              @click="sendCode"
            >
              {{ sendingCode ? 'Sending…' : codeSent ? 'Resend Code' : 'Send Code' }}
            </button>
          </div>
          <p v-if="codeSent" class="text-sm text-green-600 dark:text-green-400">
            Code sent — it expires in {{ codeExpiry }} minutes.
          </p>
          <div v-if="codeSent">
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Enter the 6-digit code</label>
            <input
              v-model="code"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="••••••"
              class="w-40 px-3 py-2 border rounded-md text-center text-xl tracking-[0.5em] dark:bg-[#142610] dark:text-white"
            />
          </div>
        </div>

        <label class="flex items-center mt-5">
          <input type="checkbox" v-model="consent" class="mr-2" />
          <span class="text-gray-700 dark:text-gray-300 text-sm">
            I am authorized to sign for {{ agreement.company.companyName }} and consent to sign electronically.
          </span>
        </label>

        <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>

        <div class="flex justify-end pt-6">
          <button
            type="button"
            :disabled="signing || !consent"
            class="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
            @click="completeSigning"
          >
            {{ signing ? 'Signing…' : 'Sign Agreement' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SignaturePad from 'vue3-signature-pad'

// Public page — no auth middleware; the token in the URL is the credential.
const route = useRoute()
const token = String(route.params.token)

const loading = ref(true)
const loadError = ref('')
const agreement = ref<any>(null)
const signed = ref(false)
const downloadUrl = ref('')

const method = ref<'signature' | 'code'>('signature')
const consent = ref(false)
const sigPad = ref<any>(null)
const signing = ref(false)
const error = ref('')

const codeChannel = ref<'email' | 'sms'>('email')
const sendingCode = ref(false)
const codeSent = ref(false)
const codeExpiry = ref(10)
const code = ref('')

const companyRows = computed(() => {
  const c = agreement.value?.company
  if (!c) return []
  return [
    { label: 'Company Name', value: c.companyName },
    { label: 'EIN #', value: c.ein },
    { label: 'Industry', value: c.industry },
    { label: 'Employee Count', value: c.employeeSize },
    { label: 'Address', value: [c.streetAddress, c.city, c.state, c.zipCode].filter(Boolean).join(', ') },
    { label: 'Phone', value: c.phoneNumber },
    { label: 'Email', value: c.companyEmail },
    { label: 'Website', value: c.website },
    { label: 'Group #', value: c.businessCode },
  ]
})

onMounted(async () => {
  try {
    const res: any = await $fetch(`/api/company-agreements/${token}`)
    agreement.value = res
    if (res.status === 'signed') signed.value = true
  } catch (err: any) {
    loadError.value = err?.data?.statusMessage || 'This review link is invalid or has expired.'
  } finally {
    loading.value = false
  }
})

function getPad() {
  return sigPad.value?.signaturePad ?? sigPad.value
}

function clearSignature() {
  getPad()?.clear()
}

async function sendCode() {
  error.value = ''
  sendingCode.value = true
  try {
    const res: any = await $fetch(`/api/company-agreements/${token}/send-code`, {
      method: 'POST',
      body: { channel: codeChannel.value },
    })
    codeSent.value = true
    codeExpiry.value = res.expiresInMinutes
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to send code'
  } finally {
    sendingCode.value = false
  }
}

async function completeSigning() {
  error.value = ''

  const body: Record<string, any> = { method: method.value }
  if (method.value === 'signature') {
    const pad = getPad()
    if (!pad || pad.isEmpty()) {
      error.value = 'Please draw a signature first.'
      return
    }
    body.signatureDataUrl = pad.toDataURL('image/png')
  } else {
    if (!/^\d{6}$/.test(code.value.trim())) {
      error.value = 'Enter the 6-digit code that was sent.'
      return
    }
    body.code = code.value.trim()
  }

  signing.value = true
  try {
    const res: any = await $fetch(`/api/company-agreements/${token}/sign`, {
      method: 'POST',
      body,
    })
    signed.value = true
    downloadUrl.value = res.downloadUrl
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to sign agreement'
  } finally {
    signing.value = false
  }
}
</script>
