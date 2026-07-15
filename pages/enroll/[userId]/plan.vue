<template>
  <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md my-8">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Select a Health Plan</h2>
    <EnrollSteps :current="2" />

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>

    <template v-else>
      <p class="text-sm text-gray-500 dark:text-gray-300 mb-4">
        Prices shown for <b>{{ tierLabel }}</b> coverage
        <NuxtLink :to="`/enroll/${userId}/applicant`" class="text-blue-600 dark:text-green-400 hover:underline">
          (change)
        </NuxtLink>
      </p>
<!---Note-->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="plan in healthPlans"
          :key="plan.value"
          role="button"
          tabindex="0"
          class="text-left border-2 rounded-xl p-5 transition cursor-pointer"
          :class="selectedPlan === plan.value
            ? 'border-blue-600 dark:border-green-500 bg-blue-50 dark:bg-[#142610]'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
          @click="selectPlan(plan)"
          @keydown.enter="selectPlan(plan)"
        >
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold text-gray-800 dark:text-white">{{ plan.label }}</span>
            <a
              :href="plan.pdfUrl || ratesPdfUrl"
              target="_blank"
              title="View plan PDF"
              class="text-gray-400 hover:text-blue-600 dark:hover:text-green-400 shrink-0 ml-2"
              @click.stop
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </a>
          </div>
          <p v-if="priceFor(plan) != null" class="text-blue-600 dark:text-green-400 font-bold text-xl mt-1">
            ${{ priceFor(plan)!.toFixed(2) }}/mo
          </p>
          <a
            v-else
            :href="plan.pdfUrl || ratesPdfUrl"
            target="_blank"
            class="inline-block text-blue-600 dark:text-green-400 font-bold text-xl mt-1 hover:underline"
            @click.stop
          >
            See PDF ↗
          </a>
          <p v-if="plan.ageBandedPrices" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <template v-if="bandFor(plan)">
              Based on applicant age {{ applicantAge }} ({{ bandFor(plan)!.label }} band)
            </template>
            <template v-else-if="applicantAge == null">
              Enter the applicant's date of birth to see their rate
            </template>
            <template v-else>
              Age {{ applicantAge }} is outside the 18–70 rate bands — see the PDF
            </template>
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-300 mt-2">{{ plan.summary }}</p>
          <ul class="mt-3 space-y-1">
            <li
              v-for="benefit in plan.benefits"
              :key="benefit"
              class="flex items-start text-sm text-gray-600 dark:text-gray-300"
            >
              <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
              <span>{{ benefit }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-6">
        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plan Price ($/mo)</label>
        <input
          type="number"
          v-model.number="planPrice"
          min="0"
          step="0.01"
          class="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
        />
      </div>

      <!-- One-time enrollment fee disclaimer -->
      <div class="mt-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-[#3d3a24] rounded-r-lg p-4">
        <p class="font-semibold text-gray-800 dark:text-white">
          One-time enrollment fee: ${{ ONE_TIME_ENROLLMENT_FEE.toFixed(2) }}
        </p>
        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
          Please make sure the client is aware of this fee before continuing —
          it is added to their first payment in addition to the monthly premium.
        </p>
        <label class="flex items-center mt-3">
          <input type="checkbox" v-model="waiveFee" class="mr-2" />
          <span class="text-sm text-gray-700 dark:text-gray-300">Waive the one-time enrollment fee</span>
        </label>
      </div>

      <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>

      <div class="flex justify-between pt-6">
        <button
          type="button"
          class="px-4 py-2 bg-gray-400 text-white rounded-lg"
          @click="navigateTo(`/enroll/${userId}/underwriting`)"
        >
          Back
        </button>
        <button
          type="button"
          :disabled="!selectedPlan || saving"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          @click="next"
        >
          {{ saving ? 'Saving…' : 'Next: Dental, Vision & Ancillary' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ONE_TIME_ENROLLMENT_FEE } from '~/utils/enrollmentFee'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const userId = Number(route.params.userId)

type Tier = 'single' | 'individual_spouse' | 'individual_child' | 'family'

interface AgeBand {
  label: string
  min: number
  max: number
  prices: Record<Tier, number>
}

interface HealthPlan {
  value: string
  label: string
  summary: string
  benefits: string[]
  // null = no flat price (age-banded or read from the rates PDF)
  prices: Record<Tier, number> | null
  // rates that vary by the applicant's age (from DOB on the application)
  ageBandedPrices?: AgeBand[]
  // plan-specific brochure; falls back to the shared rates PDF
  pdfUrl?: string
}

const ratesPdfUrl = '/pdfs/AFC_RATES_0626.PDF'

// Single prices are the confirmed rates; other tiers are PLACEHOLDERS —
// update when the real rate sheet is available. Summaries and benefit
// bullets are placeholders too — replace with the carriers' actual language.
const healthPlans: HealthPlan[] = [
  {
    value: 'plan1',
    label: 'Plan 1 — Cigna EPO',
    pdfUrl: '/pdfs/Amerishield-Brochure.pdf',
    summary: 'Exclusive provider plan on the Cigna national network with predictable in-network costs.',
    benefits: [
      'Cigna EPO national provider network',
      'No referrals needed for specialists',
      'Preventive care covered 100% in-network',
      'Prescription drug coverage included',
    ],
    prices: null,
    // Single 18–70 band for now — add more rows when the per-age rate
    // sheet is available (same shape as Plans 3 and 4)
    ageBandedPrices: [
      {
        label: '18–70', min: 18, max: 70,
        prices: { single: 699.95, individual_spouse: 1549.95, individual_child: 1449.95, family: 2149.95 },
      },
    ],
  },
  {
    value: 'plan2',
    label: 'Plan 2 — Cigna PPO',
    pdfUrl: '/pdfs/Amerus_Health_Shield_Cigna_PPO_Brochure.pdf',
    summary: 'Flexible PPO on the Cigna national network with in- and out-of-network coverage.',
    benefits: [
      'Cigna PPO National Network',
      '24/7 care navigation and support',
      'Digital ID cards and benefits access',
      'Provider search and claims visibility',
      'Virtual care and prescription support',
    ],
    prices: {
      single: 949.00,
      individual_spouse: 1799.00,
      individual_child: 1699.00,
      family: 2299.00,
    },
  },
  {
    value: 'plan3',
    label: 'Plan 3 — Low Plan',
    pdfUrl: '/pdfs/low.pdf',
    summary: 'Low Plan coverage with rates based on the applicant\'s age and coverage tier.',
    benefits: [
      'Underwritten by Low Plan',
      'Rates based on age and coverage tier',
      'Full rate table in the linked PDF',
    ],
    prices: null,
    ageBandedPrices: [
      {
        label: '18–29', min: 18, max: 29,
        prices: { single: 141.64, individual_spouse: 299.38, individual_child: 301.52, family: 452.87 },
      },
      {
        label: '30–39', min: 30, max: 39,
        prices: { single: 178.93, individual_spouse: 359.11, individual_child: 334.12, family: 526.43 },
      },
      {
        label: '40–49', min: 40, max: 49,
        prices: { single: 216.48, individual_spouse: 453.33, individual_child: 389.17, family: 628.11 },
      },
      {
        label: '50–70', min: 50, max: 70,
        prices: { single: 326.44, individual_spouse: 608.14, individual_child: 463.29, family: 771.68 },
      },
    ],
  },
  {
    value: 'plan4',
    label: 'Plan 4 — High Plan',
    pdfUrl: '/pdfs/high.pdf',
    summary: 'High Plan coverage with rates based on the applicant\'s age and coverage tier.',
    benefits: [
      'Highest level of coverage offered',
      'Rates based on age and coverage tier',
      'Full rate table in the linked PDF',
    ],
    prices: null,
    ageBandedPrices: [
      {
        label: '18–29', min: 18, max: 29,
        prices: { single: 226.44, individual_spouse: 486.19, individual_child: 492.01, family: 763.77 },
      },
      {
        label: '30–39', min: 30, max: 39,
        prices: { single: 326.38, individual_spouse: 617.43, individual_child: 567.38, family: 911.06 },
      },
      {
        label: '40–49', min: 40, max: 49,
        prices: { single: 373.14, individual_spouse: 768.10, individual_child: 641.14, family: 1059.12 },
      },
      {
        label: '50–70', min: 50, max: 70,
        prices: { single: 504.12, individual_spouse: 1021.74, individual_child: 769.47, family: 1299.46 },
      },
    ],
  },
  {
    value: 'plan5',
    label: 'Plan 5 — UHC',
    pdfUrl: '/pdfs/uhc.pdf',
    summary: 'UnitedHealthcare plan with fixed copays for everyday care and 30% coinsurance on major services.',
    benefits: [
      'Deductible $3,500 / $7,000 · Coinsurance 30%',
      'PCP copay $40 · Specialist $60',
      'Prescriptions from $0 generic copay',
      'Full benefit details in the linked PDF',
    ],
    prices: {
      single: 749,
      individual_spouse: 1499,
      individual_child: 1449,
      family: 2195,
    },
  },
]

const tierLabels: Record<Tier, string> = {
  single: 'Single',
  individual_spouse: 'Individual and Spouse',
  individual_child: 'Individual and Child',
  family: 'Family',
}

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const application = ref<any>(null)
const selectedPlan = ref('')
const planPrice = ref<number | null>(null)
const coverageTier = ref<Tier>('single')
const waiveFee = ref(false)

const tierLabel = computed(() => tierLabels[coverageTier.value])

// Applicant's age from the application: DOB preferred, typed age as fallback
const applicantAge = ref<number | null>(null)

function computeAge(app: any): number | null {
  if (app?.dateOfBirth) {
    const dob = new Date(app.dateOfBirth)
    if (!isNaN(dob.getTime())) {
      const now = new Date()
      let age = now.getFullYear() - dob.getFullYear()
      const beforeBirthday =
        now.getMonth() < dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())
      if (beforeBirthday) age--
      return age
    }
  }
  const typed = parseInt(String(app?.age ?? ''), 10)
  return isNaN(typed) ? null : typed
}

function bandFor(plan: HealthPlan): AgeBand | null {
  if (!plan.ageBandedPrices || applicantAge.value == null) return null
  return plan.ageBandedPrices.find((b) => applicantAge.value! >= b.min && applicantAge.value! <= b.max) ?? null
}

function priceFor(plan: HealthPlan): number | null {
  if (plan.ageBandedPrices) {
    const band = bandFor(plan)
    return band ? band.prices[coverageTier.value] ?? band.prices.single : null
  }
  if (!plan.prices) return null
  return plan.prices[coverageTier.value] ?? plan.prices.single
}

function selectPlan(plan: HealthPlan) {
  selectedPlan.value = plan.value
  // No fixed price (rates PDF plan): leave the field for manual entry
  planPrice.value = priceFor(plan)
}

onMounted(async () => {
  try {
    const { application: app } = await fetchEnrollmentApplication(userId)
    application.value = app
    if (app?.coverageTier && app.coverageTier in tierLabels) {
      coverageTier.value = app.coverageTier
    }
    applicantAge.value = computeAge(app)
    if (app?.healthPlan) {
      selectedPlan.value = app.healthPlan
      planPrice.value = app.healthPlanPrice ?? planPrice.value
    }
    waiveFee.value = app?.waiveOneTimeFee === true
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
      healthPlan: selectedPlan.value,
      healthPlanPrice: planPrice.value,
      waiveOneTimeFee: waiveFee.value,
    })
    await navigateTo(`/enroll/${userId}/coverage`)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to save plan selection'
  } finally {
    saving.value = false
  }
}
</script>
