<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Underwriting Questions</h2>
    <EnrollSteps :current="1" />

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>

    <template v-else>
      <div v-if="!products.length" class="text-gray-600 dark:text-gray-300">
        No underwriting questions apply — no dental/vision or ancillary products were selected.
      </div>

      <div v-for="product in products" :key="product.key" class="border rounded-xl p-5 mb-6 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">{{ product.label }}</h3>

        <div v-for="q in product.questions" :key="q.id" class="mb-5">
          <p class="text-gray-700 dark:text-gray-300 mb-2">{{ q.text }}</p>
          <div class="flex items-center space-x-6">
            <label class="flex items-center">
              <input type="radio" :value="true" v-model="answers[product.key][q.id].answer" class="mr-2" />
              <span class="text-gray-700 dark:text-gray-300">Yes</span>
            </label>
            <label class="flex items-center">
              <input type="radio" :value="false" v-model="answers[product.key][q.id].answer" class="mr-2" />
              <span class="text-gray-700 dark:text-gray-300">No</span>
            </label>
          </div>
          <div v-if="q.detailsIf !== undefined && answers[product.key][q.id].answer === q.detailsIf" class="mt-3">
            <label class="block text-gray-600 dark:text-gray-400 text-sm mb-1">{{ q.detailsLabel || 'Please provide details' }}</label>
            <textarea
              v-model="answers[product.key][q.id].details"
              rows="2"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
            ></textarea>
          </div>
        </div>
      </div>

      <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex justify-between pt-6">
        <button
          type="button"
          class="px-4 py-2 bg-gray-400 text-white rounded-lg"
          @click="navigateTo(`/enroll/${userId}/applicant`)"
        >
          Back
        </button>
        <button
          type="button"
          :disabled="saving"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          @click="next"
        >
          {{ saving ? 'Saving…' : 'Next: Select Plan' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { underwritingProducts, matchAncillaryProduct, getProductByKey, ALWAYS_ASKED_KEYS, type UnderwritingProduct } from '~/utils/underwritingQuestions'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userId = Number(route.params.userId)

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const application = ref<any>(null)
const products = ref<UnderwritingProduct[]>([])
const answers = reactive<Record<string, Record<string, { answer: boolean | null; details: string }>>>({})

onMounted(async () => {
  try {
    const { application: app } = await fetchEnrollmentApplication(userId)
    application.value = app
    if (!app) {
      error.value = 'No application found. Start from the plan page.'
      return
    }

    // General/mental health questions are always asked; product-specific
    // sets (if any exist for the selected products) are added on top
    const applicable: UnderwritingProduct[] = ALWAYS_ASKED_KEYS.map((k) => getProductByKey(k)!)
    for (const plan of app.ancillaryPlans || []) {
      const match = matchAncillaryProduct(plan.product)
      if (match && !applicable.some((p) => p.key === match.key)) applicable.push(match)
    }
    products.value = applicable

    const saved = app.underwritingAnswers || {}
    for (const product of applicable) {
      answers[product.key] = {}
      for (const q of product.questions) {
        const prev = saved?.[product.key]?.[q.id]
        answers[product.key][q.id] = {
          answer: prev?.answer ?? null,
          details: prev?.details ?? '',
        }
      }
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load application'
  } finally {
    loading.value = false
  }
})

function validate(): string | null {
  for (const product of products.value) {
    for (const q of product.questions) {
      const a = answers[product.key][q.id]
      if (a.answer === null) return `Please answer every question in ${product.label}.`
      if (q.detailsIf !== undefined && a.answer === q.detailsIf && !a.details.trim()) {
        return `Please provide details for "${q.text}"`
      }
    }
  }
  return null
}

async function next() {
  error.value = ''
  const invalid = validate()
  if (invalid) {
    error.value = invalid
    return
  }

  saving.value = true
  try {
    // Only persist details when the answer actually requires them
    const payload: Record<string, any> = {}
    for (const product of products.value) {
      payload[product.key] = {}
      for (const q of product.questions) {
        const a = answers[product.key][q.id]
        payload[product.key][q.id] = {
          answer: a.answer,
          ...(q.detailsIf !== undefined && a.answer === q.detailsIf ? { details: a.details.trim() } : {}),
        }
      }
    }

    await $fetch(`/api/applications/${application.value.id}/underwriting`, {
      method: 'POST',
      headers: useEnrollmentAuthHeaders(),
      body: { answers: payload },
    })
    await navigateTo(`/enroll/${userId}/plan`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to save underwriting answers'
  } finally {
    saving.value = false
  }
}
</script>
