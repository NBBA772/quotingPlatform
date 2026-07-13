<template>
  <div class="p-4 border border-gray-200 dark:border-gray-700 shadow rounded-lg bg-white dark:bg-[#142610]">
    <!-- Skeleton Loader -->
    <CompanyAdminRegistrationStatsSkeletonLoader v-if="loading" />

    <!-- Actual Content -->
    <div v-else>
      <h2 class="text-lg font-bold mb-2">Agent Invited Company Registration Rate</h2>

      <!-- Info -->
      <p class="text-sm text-white dark:text-gray-300 mb-2">
        {{ registeredCount }} of {{ invitedCount }} companies registered
      </p>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-[#3a4934] rounded-full h-3 overflow-hidden">
        <div
          class="bg-green-500 h-3 rounded-full transition-all duration-500"
          :style="{ width: completionRate + '%' }"
        ></div>
      </div>

      <p class="text-sm mt-2 font-medium">
        {{ completionRate.toFixed(1) }}%
      </p>

      <!-- Props & Functions tables (mock mode only) -->
      <div v-if="props.mock">
        <!-- Props Table -->
        <div class="mt-8">
          <h2 class="text-lg font-bold mb-2">Props</h2>
          <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr class="bg-gray-100 dark:bg-[#3a4934]">
                <th class="border p-2 text-left">Name</th>
                <th class="border p-2 text-left">Type</th>
                <th class="border p-2 text-left">Default</th>
                <th class="border p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border p-2">mock</td>
                <td class="border p-2">boolean</td>
                <td class="border p-2">false</td>
                <td class="border p-2">
                  If true, uses fake registration stats and displays props & functions tables.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Functions Table -->
        <div class="mt-8">
          <h2 class="text-lg font-bold mb-2">Functions</h2>
          <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr class="bg-gray-100 dark:bg-[#3a4934]">
                <th class="border p-2 text-left">Name</th>
                <th class="border p-2 text-left">Parameters</th>
                <th class="border p-2 text-left">Returns</th>
                <th class="border p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border p-2">fetchAgentCompanyStats</td>
                <td class="border p-2">None</td>
                <td class="border p-2">Promise&lt;void&gt;</td>
                <td class="border p-2">
                  Fetches registration stats for companies invited by the agent. 
                  If <code>mock</code> is true, loads fake data instead of API call.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Props
const props = withDefaults(defineProps<{ mock?: boolean }>(), { mock: false });

const loading = ref(true);

const invitedCount = ref(0);
const registeredCount = ref(0);

const completionRate = computed(() => {
  if (!invitedCount.value) return 0;
  return (registeredCount.value / invitedCount.value) * 100;
});

// Fetch stats
async function fetchAgentCompanyStats() {
  if (props.mock) {
    invitedCount.value = 12;
    registeredCount.value = 7;
    loading.value = false;
    return;
  }

  try {
    const data = await $fetch("/api/insurance-agent/company-registration-stats");
    invitedCount.value = data.invitedCount;
    registeredCount.value = data.registeredCount;
  } catch (err) {
    console.error("Failed to fetch agent company registration stats:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchAgentCompanyStats();
});
</script>
