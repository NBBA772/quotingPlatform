<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Payment & Sign</h2>
    <EnrollSteps :current="4" />

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>

    <!-- Signed state -->
    <div v-else-if="signed" class="py-8">
      <div class="text-center">
        <div class="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">Application Signed</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-6">The signed PDF has been saved to this application.</p>
        <a
          v-if="downloadUrl"
          :href="downloadUrl"
          target="_blank"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        >
          Download Signed PDF
        </a>
      </div>

      <!-- Payment via ePayPolicy -->
      <div class="mt-8">
        <EnrollPaymentForm :application-id="application.id" />
      </div>
    </div>

    <template v-else>
      <!-- 1. Payment first -->
      <div class="mb-6">
        <EnrollPaymentForm :application-id="application.id" @paid="paymentDone = true" />
      </div>

      <!-- 2. Review & sign, unlocked once payment is complete -->
      <div v-if="!paymentDone" class="border rounded-xl p-5 mb-6 dark:border-gray-600">
        <p class="text-gray-500 dark:text-gray-300 text-center">
          Signing unlocks after the payment above is completed.
        </p>
        <div class="flex justify-start pt-4">
          <button
            type="button"
            class="px-4 py-2 bg-gray-400 text-white rounded-lg"
            @click="navigateTo(`/enroll/${userId}/coverage`)"
          >
            Back
          </button>
        </div>
      </div>

      <template v-else>
      <!-- PDF generation / preview -->
      <div class="border rounded-xl p-5 mb-6 dark:border-gray-600">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Application PDF</h3>
          <button
            type="button"
            :disabled="generating"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
            @click="generatePdf"
          >
            {{ generating ? 'Generating…' : previewUrl ? 'Regenerate PDF' : 'Generate PDF' }}
          </button>
        </div>
        <iframe
          v-if="previewUrl"
          :src="previewUrl"
          class="w-full h-96 border rounded-md dark:border-gray-600"
        ></iframe>
        <p v-else class="text-sm text-gray-500 dark:text-gray-300">
          Generate the PDF to review the application before signing.
        </p>
      </div>

      <!-- Signing -->
      <div v-if="previewUrl" class="border rounded-xl p-5 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sign the Application</h3>

        <div class="flex space-x-2 mb-5">
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium"
            :class="method === 'code' ? 'bg-blue-600 text-white dark:bg-[#046937]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            @click="method = 'code'"
          >
            6-Digit Code
          </button>
          <button
            v-if="isOwner"
            type="button"
            class="px-4 py-2 rounded-lg font-medium"
            :class="method === 'signature' ? 'bg-blue-600 text-white dark:bg-[#046937]' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            @click="method = 'signature'"
          >
            Draw Signature
          </button>
        </div>
        <p v-if="method === 'code'" class="text-sm text-gray-500 dark:text-gray-300 mb-4 -mt-2">
          Send the code to the enrollee — it goes to their email on file. Ask them to read it back, then enter it below.
        </p>

        <!-- Draw signature -->
        <div v-if="method === 'signature'">
          <SignaturePad
            ref="sigPad"
            class="w-full h-40 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#3a3a3a]"
          />
          <button type="button" class="text-sm text-gray-500 hover:text-gray-700 mt-2" @click="clearSignature">
            Clear
          </button>
        </div>

        <!-- 6-digit code -->
        <div v-else class="space-y-4">
          <div class="flex items-center space-x-3">
            <button
              type="button"
              :disabled="sendingCode"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
              @click="sendCode"
            >
              {{ sendingCode ? 'Sending…' : codeSentTo ? 'Resend Code' : 'Email Code' }}
            </button>
          </div>
          <p v-if="codeSentTo" class="text-sm text-green-600 dark:text-green-400">
            Code sent to {{ codeSentTo }} — it expires in {{ codeExpiry }} minutes.
          </p>
          <div>
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

        <!-- Consent -->
        <label class="flex items-center mt-5">
          <input type="checkbox" v-model="consent" class="mr-2" />
          <span class="text-gray-700 dark:text-gray-300 text-sm">
            I consent to electronically sign this application.
          </span>
        </label>

        <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>

        <div class="flex justify-between pt-6">
          <button
            type="button"
            class="px-4 py-2 bg-gray-400 text-white rounded-lg"
            @click="navigateTo(`/enroll/${userId}/coverage`)"
          >
            Back
          </button>
          <button
            type="button"
            :disabled="signing || !consent"
            class="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
            @click="completeSigning"
          >
            {{ signing ? 'Signing…' : 'Sign Application' }}
          </button>
        </div>
      </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SignaturePad from 'vue3-signature-pad'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userId = Number(route.params.userId)

const loading = ref(true)
const generating = ref(false)
const signing = ref(false)
const sendingCode = ref(false)
const error = ref('')

const application = ref<any>(null)
const previewUrl = ref('')
const signed = ref(false)
const downloadUrl = ref('')
const paymentDone = ref(false)

// Only the enrollee themselves may draw a signature; an agent working the
// application on their behalf must use the 6-digit code
const isOwner = ref(false)

const method = ref<'signature' | 'code'>('code')
const consent = ref(false)
const sigPad = ref<any>(null)

const codeSentTo = ref('')
const codeExpiry = ref(10)
const code = ref('')

onMounted(async () => {
  try {
    const me: any = await $fetch('/api/user', {
      headers: useEnrollmentAuthHeaders(),
    }).catch(() => null)
    isOwner.value = (me?.user?.id ?? me?.id) === userId

    const { application: app } = await fetchEnrollmentApplication(userId)
    application.value = app
    if (!app) {
      error.value = 'No application found. Start from the plan page.'
      return
    }
    if (app.signedAt) {
      signed.value = true
    } else {
      // Payment happens before signing — check whether it's already done
      try {
        const info: any = await $fetch(`/api/applications/${app.id}/payment-info`, {
          headers: useEnrollmentAuthHeaders(),
        })
        paymentDone.value = !!info?.alreadyPaid
      } catch {
        paymentDone.value = false
      }
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load application'
  } finally {
    loading.value = false
  }
})

async function generatePdf() {
  error.value = ''
  generating.value = true
  try {
    const res: any = await $fetch(`/api/applications/${application.value.id}/generate-pdf`, {
      method: 'POST',
      headers: useEnrollmentAuthHeaders(),
    })
    previewUrl.value = res.previewUrl
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to generate PDF'
  } finally {
    generating.value = false
  }
}

async function sendCode() {
  error.value = ''
  sendingCode.value = true
  try {
    const res: any = await $fetch(`/api/applications/${application.value.id}/send-code`, {
      method: 'POST',
      headers: useEnrollmentAuthHeaders(),
      body: { channel: 'email' },
    })
    codeSentTo.value = res.sentTo
    codeExpiry.value = res.expiresInMinutes
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to send code'
  } finally {
    sendingCode.value = false
  }
}

function getPad() {
  // vue3-signature-pad exposes the underlying pad on `.signaturePad`
  return sigPad.value?.signaturePad ?? sigPad.value
}

function clearSignature() {
  getPad()?.clear()
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
    const res: any = await $fetch(`/api/applications/${application.value.id}/sign-complete`, {
      method: 'POST',
      headers: useEnrollmentAuthHeaders(),
      body,
    })
    signed.value = true
    downloadUrl.value = res.downloadUrl
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to sign application'
  } finally {
    signing.value = false
  }
}
</script>
