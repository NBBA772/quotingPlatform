<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Select Your Plan</h2>
      <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">
        Choose a plan and coverage level. Your selection is saved to your application.
      </p>
    </div>

    <!-- Coverage tier -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Coverage</label>
      <select
        v-model="coverageTier"
        class="w-full md:w-72 px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
      >
        <option v-for="(label, key) in tierLabels" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading plans…</div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>
    <div v-else-if="plans.length === 0" class="text-gray-500 dark:text-gray-300">
      No plans are available yet. Please check back soon.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        role="button"
        tabindex="0"
        class="text-left border-2 rounded-xl p-5 transition cursor-pointer"
        :class="selectedPlanId === plan.id
          ? 'border-blue-600 dark:border-green-500 bg-blue-50 dark:bg-[#142610]'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
        @click="selectedPlanId = plan.id"
        @keydown.enter="selectedPlanId = plan.id"
      >
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold text-gray-800 dark:text-white">{{ plan.name }}</span>
          <a
            v-if="plan.pdfUrl"
            :href="plan.pdfUrl"
            target="_blank"
            class="text-gray-400 hover:text-blue-600 dark:hover:text-green-400 text-sm shrink-0 ml-2"
            @click.stop
          >PDF ↗</a>
        </div>
        <p v-if="priceFor(plan) != null" class="text-blue-600 dark:text-green-400 font-bold text-xl mt-1">
          ${{ priceFor(plan)!.toFixed(2) }}/mo
        </p>
        <p v-if="plan.planType || plan.networkType" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ [plan.planType, plan.networkType].filter(Boolean).join(' · ') }}
        </p>
        <p v-if="plan.description" class="text-sm text-gray-500 dark:text-gray-300 mt-2">{{ plan.description }}</p>
        <ul class="mt-3 space-y-1">
          <li v-for="b in plan.benefits" :key="b.id" class="flex items-start text-sm text-gray-600 dark:text-gray-300">
            <span class="text-green-600 dark:text-green-400 mr-2">✓</span>
            <span>{{ b.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <p v-if="saveError" class="text-red-600 dark:text-red-400">{{ saveError }}</p>
    <p v-if="saved" class="text-green-600 dark:text-green-400">✓ Your plan selection has been saved.</p>

    <div v-if="plans.length" class="pt-2">
      <button
        type="button"
        :disabled="!selectedPlanId || saving"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        @click="save"
      >
        {{ saving ? 'Saving…' : 'Save Selection' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { fetchEnrollmentApplication, saveEnrollmentStep, useEnrollmentAuthHeaders } from '~/composables/useEnrollment'

const props = defineProps<{ companyId?: number | null; userId?: number | null }>()

type Tier = 'single' | 'individual_spouse' | 'individual_child' | 'family'
const tierLabels: Record<Tier, string> = {
  single: 'Single',
  individual_spouse: 'Individual and Spouse',
  individual_child: 'Individual and Child',
  family: 'Family',
}

const plans = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const coverageTier = ref<Tier>('single')
const selectedPlanId = ref<number | null>(null)

const application = ref<any>(null)
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

function priceFor(plan: any): number | null {
  const map: Record<Tier, string> = {
    single: 'priceSingle',
    individual_spouse: 'priceIndividualSpouse',
    individual_child: 'priceIndividualChild',
    family: 'priceFamily',
  }
  const v = plan[map[coverageTier.value]]
  return v == null ? (plan.priceSingle ?? null) : v
}

watch(saved, (v) => { if (v) setTimeout(() => (saved.value = false), 4000) })

onMounted(async () => {
  try {
    if (!props.companyId) throw new Error('No company found for your account.')
    const res: any = await $fetch(`/api/company/${props.companyId}/custom-plans`, {
      headers: useEnrollmentAuthHeaders(),
    })
    plans.value = res.plans || []

    if (props.userId) {
      const { application: app } = await fetchEnrollmentApplication(props.userId)
      application.value = app
      if (app?.coverageTier && app.coverageTier in tierLabels) coverageTier.value = app.coverageTier
      if (app?.customPlanId) selectedPlanId.value = app.customPlanId
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to load plans'
  } finally {
    loading.value = false
  }
})

async function save() {
  saveError.value = ''
  saved.value = false
  if (!selectedPlanId.value || !props.userId) return
  const plan = plans.value.find((p) => p.id === selectedPlanId.value)
  saving.value = true
  try {
    application.value = await saveEnrollmentStep(props.userId, application.value, {
      customPlanId: selectedPlanId.value,
      healthPlan: plan?.name ?? null,
      healthPlanPrice: priceFor(plan),
      coverageTier: coverageTier.value,
    })
    saved.value = true
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err?.message || 'Failed to save selection'
  } finally {
    saving.value = false
  }
}
</script>
