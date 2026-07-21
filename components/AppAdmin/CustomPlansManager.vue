<template>
  <div class="mx-auto py-6 space-y-6">
    <h2 class="text-xl font-bold text-gray-800 dark:text-white">Custom Plans</h2>
    <p class="text-sm text-gray-500 dark:text-gray-300">
      Build the plans a custom company's employees choose from when they log in.
    </p>

    <!-- Company picker -->
    <div>
      <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company</label>
      <select
        v-model="selectedCompanyId"
        class="w-full md:w-96 px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
        @change="loadPlans"
      >
        <option :value="null" disabled>Select a custom company…</option>
        <option v-for="c in customCompanies" :key="c.id" :value="c.id">
          {{ c.companyName }} (code {{ c.businessCode }})
        </option>
      </select>
      <p v-if="!loadingCompanies && customCompanies.length === 0" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        No custom companies yet. An agent creates one from their dashboard (Custom → New Custom Company).
      </p>
    </div>

    <template v-if="selectedCompanyId">
      <!-- Existing plans -->
      <div v-if="loadingPlans" class="text-gray-500 dark:text-gray-300">Loading plans…</div>
      <div v-else class="space-y-3">
        <div v-if="plans.length === 0" class="text-gray-500 dark:text-gray-300">No plans yet.</div>
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="border rounded-xl p-4 dark:border-gray-600 flex justify-between items-start"
        >
          <div>
            <p class="font-semibold text-gray-800 dark:text-white">
              {{ plan.name }}
              <span v-if="plan.planType" class="text-xs text-gray-500 dark:text-gray-400">· {{ plan.planType }}</span>
            </p>
            <p v-if="plan.description" class="text-sm text-gray-500 dark:text-gray-300">{{ plan.description }}</p>
            <p class="text-sm text-blue-600 dark:text-green-400 mt-1">
              <span v-if="plan.priceSingle != null">Single ${{ plan.priceSingle }}</span>
              <span v-if="plan.priceFamily != null"> · Family ${{ plan.priceFamily }}</span>
            </p>
            <ul class="mt-1 text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
              <li v-for="b in plan.benefits" :key="b.id">{{ b.text }}</li>
            </ul>
          </div>
          <div class="flex gap-2 shrink-0">
            <button class="text-blue-600 hover:underline text-sm" @click="editPlan(plan)">Edit</button>
            <button class="text-red-600 hover:underline text-sm" @click="removePlan(plan.id)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Create / edit form -->
      <div class="border-t pt-6 dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          {{ editingId ? 'Edit plan' : 'Add a plan' }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plan Name</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plan Type (PPO/HMO/EPO)</label>
            <input v-model="form.planType" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Description</label>
            <textarea v-model="form.description" rows="2" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Network</label>
            <input v-model="form.networkType" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Plan PDF URL (optional)</label>
            <input v-model="form.pdfUrl" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Single $/mo</label>
            <input v-model.number="form.priceSingle" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">+ Spouse $/mo</label>
            <input v-model.number="form.priceIndividualSpouse" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">+ Child $/mo</label>
            <input v-model.number="form.priceIndividualChild" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Family $/mo</label>
            <input v-model.number="form.priceFamily" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
          </div>
        </div>

        <!-- Benefits -->
        <div class="mt-4">
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Benefits</label>
          <div v-for="(b, i) in form.benefits" :key="i" class="flex gap-2 mb-2">
            <input v-model="form.benefits[i]" type="text" class="flex-1 px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" placeholder="e.g. Preventive care covered 100%" />
            <button type="button" class="text-red-600 px-2" @click="form.benefits.splice(i, 1)">✕</button>
          </div>
          <button type="button" class="text-blue-600 text-sm hover:underline" @click="form.benefits.push('')">+ Add benefit</button>
        </div>

        <p v-if="error" class="text-red-600 dark:text-red-400 mt-3">{{ error }}</p>

        <div class="flex gap-3 mt-4">
          <button
            type="button"
            :disabled="saving"
            class="px-5 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937]"
            @click="savePlan"
          >
            {{ saving ? 'Saving…' : editingId ? 'Update Plan' : 'Add Plan' }}
          </button>
          <button v-if="editingId" type="button" class="px-4 py-2 bg-gray-400 text-white rounded-lg" @click="resetForm">
            Cancel
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCookie } from '#imports'

const authToken = useCookie('auth_token').value
const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {}

const customCompanies = ref<any[]>([])
const loadingCompanies = ref(true)
const selectedCompanyId = ref<number | null>(null)

const plans = ref<any[]>([])
const loadingPlans = ref(false)

const editingId = ref<number | null>(null)
const saving = ref(false)
const error = ref('')

const blank = () => ({
  name: '', description: '', planType: '', networkType: '', pdfUrl: '',
  priceSingle: null as number | null,
  priceIndividualSpouse: null as number | null,
  priceIndividualChild: null as number | null,
  priceFamily: null as number | null,
  benefits: [] as string[],
})
const form = ref(blank())

const loadCompanies = async () => {
  loadingCompanies.value = true
  try {
    const res: any = await $fetch('/api/companies/list', { headers: authHeaders })
    customCompanies.value = (res.companies || []).filter((c: any) => c.enrollmentType === 'custom')
  } catch (err) {
    console.error('Failed to load companies:', err)
  } finally {
    loadingCompanies.value = false
  }
}

const loadPlans = async () => {
  if (!selectedCompanyId.value) return
  loadingPlans.value = true
  resetForm()
  try {
    const res: any = await $fetch('/api/admin/custom-plans', {
      headers: authHeaders,
      query: { companyId: selectedCompanyId.value },
    })
    plans.value = res.plans || []
  } catch (err) {
    console.error('Failed to load plans:', err)
  } finally {
    loadingPlans.value = false
  }
}

const editPlan = (plan: any) => {
  editingId.value = plan.id
  form.value = {
    name: plan.name || '',
    description: plan.description || '',
    planType: plan.planType || '',
    networkType: plan.networkType || '',
    pdfUrl: plan.pdfUrl || '',
    priceSingle: plan.priceSingle,
    priceIndividualSpouse: plan.priceIndividualSpouse,
    priceIndividualChild: plan.priceIndividualChild,
    priceFamily: plan.priceFamily,
    benefits: (plan.benefits || []).map((b: any) => b.text),
  }
}

const resetForm = () => {
  editingId.value = null
  form.value = blank()
  error.value = ''
}

const savePlan = async () => {
  error.value = ''
  if (!form.value.name.trim()) {
    error.value = 'Plan name is required.'
    return
  }
  saving.value = true
  try {
    const payload = { ...form.value, companyId: selectedCompanyId.value }
    if (editingId.value) {
      await $fetch(`/api/admin/custom-plans/${editingId.value}`, { method: 'PUT', headers: authHeaders, body: payload })
    } else {
      await $fetch('/api/admin/custom-plans', { method: 'POST', headers: authHeaders, body: payload })
    }
    await loadPlans()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to save plan'
  } finally {
    saving.value = false
  }
}

const removePlan = async (id: number) => {
  if (!confirm('Delete this plan?')) return
  try {
    await $fetch(`/api/admin/custom-plans/${id}`, { method: 'DELETE', headers: authHeaders })
    plans.value = plans.value.filter((p) => p.id !== id)
  } catch (err) {
    console.error('Failed to delete plan:', err)
    alert('Failed to delete plan')
  }
}

onMounted(loadCompanies)
</script>
