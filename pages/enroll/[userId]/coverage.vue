<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dental, Vision & Ancillary</h2>
    <EnrollSteps :current="3" />

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>

    <template v-else>
      <!-- Dental & Vision -->
      <div class="border rounded-xl p-5 mb-6 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Dental & Vision Coverage</h3>
            <p class="text-sm text-gray-500 dark:text-gray-300">Add dental and vision to this application.</p>
          </div>
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input type="radio" :value="true" v-model="dentalVision" class="mr-2" />
              <span class="text-gray-700 dark:text-gray-300">Yes</span>
            </label>
            <label class="flex items-center">
              <input type="radio" :value="false" v-model="dentalVision" class="mr-2" />
              <span class="text-gray-700 dark:text-gray-300">No</span>
            </label>
          </div>
        </div>
        <div v-if="dentalVision" class="mt-4">
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Dental & Vision Price ($/mo)</label>
          <input
            type="number"
            v-model.number="dentalVisionPrice"
            min="0"
            step="0.01"
            class="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <template v-if="coverageTier">Auto-priced for {{ tierLabels[coverageTier] || coverageTier }} coverage</template>
            <template v-else>Select coverage on the Applicant step to auto-price</template>
          </p>
        </div>
      </div>

      <!-- Ancillary -->
      <div class="border rounded-xl p-5 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">Ancillary Products</h3>
        <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">
          Add life, accident, or other ancillary products. Underwriting questions on the next page depend on the products chosen here.
        </p>

        <div
          v-for="(plan, index) in ancillaryPlans"
          :key="index"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-end"
        >
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Product</label>
            <select
              v-model="plan.product"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              @change="applyAncillaryRate(plan)"
            >
              <option value="">Select product</option>
              <option v-for="p in ancillaryProductOptions" :key="p" :value="p">{{ p }}</option>
            </select>
            <p v-if="rateNote(plan)" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ rateNote(plan) }}</p>
          </div>
          <div class="flex items-end space-x-2">
            <div class="flex-1">
              <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Price ($/mo)</label>
              <input
                type="number"
                v-model.number="plan.price"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
              />
            </div>
            <button type="button" class="text-red-500 hover:text-red-700 pb-2" @click="ancillaryPlans.splice(index, 1)">
              Remove
            </button>
          </div>
        </div>

        <button
          type="button"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          @click="ancillaryPlans.push({ planName: '', product: '', price: null })"
        >
          + Add Product
        </button>
      </div>

      <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex justify-between pt-6">
        <button
          type="button"
          class="px-4 py-2 bg-gray-400 text-white rounded-lg"
          @click="navigateTo(`/enroll/${userId}/plan`)"
        >
          Back
        </button>
        <button
          type="button"
          :disabled="dentalVision === null || saving"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          @click="next"
        >
          {{ saving ? 'Saving…' : 'Next: Payment & Sign' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userId = Number(route.params.userId)

// Products offered on this application; each auto-prices from the rate
// tables below (age-banded or coverage-tier).
const ancillaryProductOptions = [
  'Life — Individual',
  'Life — Spouse',
  'Accident',
  'Critical Illness',
]

interface AgeRate { min: number; max: number; price: number }

// Monthly rates by the covered person's age at enrollment
const ancillaryAgeRates: Record<string, { rates: AgeRate[]; whose: 'applicant' | 'spouse' }> = {
  'Life — Individual': {
    whose: 'applicant',
    rates: [
      { min: 18, max: 25, price: 8.51 },
      { min: 26, max: 35, price: 10.68 },
      { min: 36, max: 45, price: 17.54 },
      { min: 46, max: 55, price: 35.10 },
      { min: 56, max: 60, price: 58.35 },
    ],
  },
  'Life — Spouse': {
    whose: 'spouse',
    rates: [
      { min: 18, max: 25, price: 7.28 },
      { min: 26, max: 35, price: 9.13 },
      { min: 36, max: 45, price: 15.47 },
      { min: 46, max: 55, price: 32.60 },
      { min: 56, max: 60, price: 51.35 },
    ],
  },
  'Critical Illness': {
    whose: 'applicant',
    rates: [
      { min: 18, max: 29, price: 16.58 },
      { min: 30, max: 39, price: 29.87 },
      { min: 40, max: 49, price: 68.12 },
      { min: 50, max: 59, price: 131.14 },
      { min: 60, max: 64, price: 211.14 },
    ],
  },
}

// Monthly rates that depend on the coverage tier chosen on the Applicant step
const ancillaryTierRates: Record<string, Record<string, number>> = {
  Accident: {
    single: 32.33,
    individual_spouse: 56.83,
    individual_child: 70.48,
    family: 89.88,
  },
}

const tierLabels: Record<string, string> = {
  single: 'Single',
  individual_spouse: 'Individual and Spouse',
  individual_child: 'Individual and Child',
  family: 'Family',
}

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const application = ref<any>(null)

const dentalVision = ref<boolean | null>(null)
const dentalVisionPrice = ref<number | null>(null)
const ancillaryPlans = ref<{ planName: string; product: string; price: number | null }[]>([])

// Dental & Vision monthly rates by coverage tier
const dentalVisionTierRates: Record<string, number> = {
  single: 79.95,
  individual_spouse: 159.95,
  individual_child: 199.95,
  family: 279.95,
}

watch(dentalVision, (val) => {
  if (val === true && !dentalVisionPrice.value) {
    dentalVisionPrice.value = coverageTier.value ? dentalVisionTierRates[coverageTier.value] ?? null : null
  }
  if (val === false) dentalVisionPrice.value = 0
})

const applicantAge = ref<number | null>(null)
const spouseAge = ref<number | null>(null)
const coverageTier = ref<string>('')

function computeAge(dob: any, typed: any): number | null {
  if (dob) {
    const d = new Date(dob)
    if (!isNaN(d.getTime())) {
      const now = new Date()
      let age = now.getFullYear() - d.getFullYear()
      if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--
      return age
    }
  }
  const parsed = parseInt(String(typed ?? ''), 10)
  return isNaN(parsed) ? null : parsed
}

function ancillaryRateFor(product: string): { price: number | null; age: number | null; whose: string } | null {
  const table = ancillaryAgeRates[product]
  if (!table) return null
  const age = table.whose === 'spouse' ? spouseAge.value : applicantAge.value
  if (age == null) return { price: null, age: null, whose: table.whose }
  const band = table.rates.find((r) => age >= r.min && age <= r.max)
  return { price: band?.price ?? null, age, whose: table.whose }
}

function tierRateFor(product: string): { price: number | null } | null {
  const table = ancillaryTierRates[product]
  if (!table) return null
  return { price: coverageTier.value ? table[coverageTier.value] ?? null : null }
}

function applyAncillaryRate(plan: { product: string; price: number | null }) {
  const tierRate = tierRateFor(plan.product)
  if (tierRate) {
    plan.price = tierRate.price
    return
  }
  const rate = ancillaryRateFor(plan.product)
  if (rate) plan.price = rate.price
}

function rateNote(plan: { product: string }): string {
  const tierRate = tierRateFor(plan.product)
  if (tierRate) {
    if (!coverageTier.value) return 'Select coverage on the Applicant step to auto-price'
    if (tierRate.price == null) return 'No rate for this coverage — enter the price manually'
    return `Auto-priced for ${tierLabels[coverageTier.value] || coverageTier.value} coverage`
  }
  const rate = ancillaryRateFor(plan.product)
  if (!rate) return ''
  const who = rate.whose === 'spouse' ? 'spouse' : 'applicant'
  if (rate.age == null) return `Enter the ${who}'s date of birth on the Applicant step to auto-price`
  if (rate.price == null) {
    const bands = ancillaryAgeRates[plan.product].rates
    return `${who.charAt(0).toUpperCase() + who.slice(1)} age ${rate.age} is outside the ${bands[0].min}–${bands[bands.length - 1].max} rate bands — enter the price manually`
  }
  return `Auto-priced from ${who} age ${rate.age}`
}

onMounted(async () => {
  try {
    const { application: app } = await fetchEnrollmentApplication(userId)
    application.value = app
    if (app) {
      applicantAge.value = computeAge(app.dateOfBirth, app.age)
      spouseAge.value = computeAge(app.spouseDateOfBirth, app.spouseAge)
      coverageTier.value = app.coverageTier || ''
      dentalVision.value = app.visionAndDentalPlan ?? null
      dentalVisionPrice.value = app.visionAndDentalPrice ?? null
      ancillaryPlans.value = (app.ancillaryPlans || [])
        .filter((p: any) => p.planName || p.product || p.price != null)
        .map((p: any) => ({ planName: p.planName || '', product: p.product || '', price: p.price ?? null }))
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load application'
  } finally {
    loading.value = false
  }
})

async function next() {
  error.value = ''
  saving.value = true
  try {
    await saveEnrollmentStep(userId, application.value, {
      visionAndDentalPlan: dentalVision.value,
      visionAndDentalPrice: dentalVisionPrice.value,
      ancillaryPlans: ancillaryPlans.value.filter((p) => p.planName || p.product || p.price != null),
    })
    await navigateTo(`/enroll/${userId}/sign`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to save coverage selections'
  } finally {
    saving.value = false
  }
}
</script>
