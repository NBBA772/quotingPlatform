<template>
  <div class="coverage-summary border border-gray-200 dark:border-gray-700 shadow p-4 bg-white dark:bg-[#142610] rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Coverage Summary</h2>

    <CompanyAdminCoverageSummarySkeletonLoader v-if="loading" />

    <div v-else>
      <div v-if="summary.length === 0" class="text-gray-500 dark:text-gray-300">
        No coverage data found.
      </div>

      <table class="w-full table-auto border-collapse text-left table-fixed">
        <thead>
          <tr>
            <th class="w-1/2 border-b border-gray-200 dark:border-gray-700 py-2 px-4">Plan</th>
            <th class="w-1/2 border-b border-gray-200 dark:border-gray-700 py-2 px-4 text-right">Employees</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(plan, index) in summary"
            :key="index"
            class="hover:bg-gray-50 dark:hover:bg-[#566051]"
          >
            <td class="py-2 px-4 break-words">{{ plan.planName }}</td>
            <td class="py-2 px-4 text-right">{{ plan.count }}</td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- Props & Functions Tables -->
    <div v-if="props.mock" class="mt-6">
      <h3 class="font-bold mb-2">Props</h3>
      <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 dark:bg-[#3a4934]">
          <tr>
            <th class="border px-4 py-2">Prop</th>
            <th class="border px-4 py-2">Type</th>
            <th class="border px-4 py-2">Default</th>
            <th class="border px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in propsMeta" :key="p.name">
            <td class="border px-4 py-2 font-mono">{{ p.name }}</td>
            <td class="border px-4 py-2 font-mono">{{ p.type }}</td>
            <td class="border px-4 py-2 font-mono">{{ p.default }}</td>
            <td class="border px-4 py-2">{{ p.description }}</td>
          </tr>
        </tbody>
      </table>

      <h3 class="font-bold mt-6 mb-2">Functions</h3>
      <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 dark:bg-[#3a4934]">
          <tr>
            <th class="border px-4 py-2">Function</th>
            <th class="border px-4 py-2">Parameters</th>
            <th class="border px-4 py-2">Returns</th>
            <th class="border px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in functionsMeta" :key="f.name">
            <td class="border px-4 py-2 font-mono">{{ f.name }}</td>
            <td class="border px-4 py-2 font-mono">{{ f.parameters }}</td>
            <td class="border px-4 py-2 font-mono">{{ f.returns }}</td>
            <td class="border px-4 py-2">{{ f.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, withDefaults, defineProps } from 'vue'

interface PlanSummary {
  planName: string
  count: number
}

// Props
const props = withDefaults(
  defineProps<{
    mock?: boolean
  }>(),
  { mock: false }
)

const summary = ref<PlanSummary[]>([])
const loading = ref(true)

// Demo data for mock mode
const demoSummary: PlanSummary[] = [
  { planName: "Health Plan A", count: 25 },
  { planName: "Dental Plan B", count: 15 },
  { planName: "Vision Plan C", count: 10 },
]

// Fetch function
const fetchCoverageSummary = async () => {
  loading.value = true
  try {
    if (props.mock) {
      // Use demo data
      summary.value = [...demoSummary]
    } else {
      const data: PlanSummary[] = await $fetch('/api/company/coverage-summary')
      summary.value = data
    }
  } catch (err) {
    console.error('Failed to fetch coverage summary:', err)
    summary.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchCoverageSummary)

// --- Documentation metadata ---
const propsMeta = [
  { name: "mock", type: "boolean", default: "false", description: "If true, shows demo coverage summary instead of fetching from API." },
]

const functionsMeta = [
  { name: "fetchCoverageSummary", parameters: "none", returns: "Promise<void>", description: "Fetches coverage summary from API or loads demo data if mock=true." },
]
</script>

<style scoped>
.coverage-summary table th,
.coverage-summary table td {
  border-bottom: 1px solid #e5e7eb;
  word-wrap: break-word;
}

</style>
