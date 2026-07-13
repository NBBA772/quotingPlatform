<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthCookie } from "~/composables/useAuth";

interface Plan {
  id: number;
  userId: number;
  planName: string;
  planType?: string;
  coverageStart?: string;
  coverageEnd?: string;
  networkType?: string;
  primaryCareRequired?: boolean;
  referralRequired?: boolean;
  outOfNetwork?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Props
const props = withDefaults(
  defineProps<{
    userId: number | null;
    mock?: boolean;
  }>(),
  {
    userId: null,
    mock: false,
  }
);

const plan = ref<Plan | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const authCookie = useAuthCookie();

// Demo plan for mock mode
const demoPlan: Plan = {
  id: 1,
  userId: 1,
  planName: "Sample PPO Plan",
  planType: "PPO",
  coverageStart: "2025-01-01",
  coverageEnd: "2025-12-31",
  networkType: "In-Network",
  primaryCareRequired: true,
  referralRequired: false,
  outOfNetwork: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const fetchPlan = async () => {
  loading.value = true;
  error.value = null;

  // Mock mode with no userId
  if (props.mock && !props.userId) {
    await new Promise((r) => setTimeout(r, 200));
    plan.value = demoPlan;
    loading.value = false;
    return;
  }

  if (!props.userId) {
    plan.value = null;
    loading.value = false;
    return;
  }

  try {
    const token = authCookie.value;
    if (!token) throw new Error("Missing auth token");

    const res = await $fetch(`/api/plan-details/${props.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    plan.value = res.plan || null;
  } catch (err) {
    console.error("❌ Failed to fetch plan", err);
    error.value = "Failed to load plan details.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPlan);
watch(() => props.userId, fetchPlan);

// --- Documentation metadata ---
const propsMeta = [
  { name: "userId", type: "number | null", default: "null", description: "The ID of the user whose plan will be displayed." },
  { name: "mock", type: "boolean", default: "false", description: "If true and no userId, displays a demo plan; otherwise fetches from API." },
];

const functionsMeta = [
  { name: "fetchPlan", parameters: "none", returns: "Promise<void>", description: "Fetches plan details for the user if mock is false or userId exists; otherwise loads demo plan." },
];
</script>

<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="plan-benefit-display bg-white dark:bg-[#142610] rounded-lg p-4 my-4 shadow">
    <h2 class="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Plan Details</h2>

    <EmployeePlanDetailsSkeletonLoader v-if="loading && !props.mock" />

    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <ul v-else-if="plan" class="space-y-2 text-gray-800 dark:text-gray-200">
      <li><strong>Plan Name:</strong> {{ plan.planName }}</li>
      <li><strong>Plan Type:</strong> {{ plan.planType ?? "N/A" }}</li>
      <li><strong>Coverage Start:</strong> {{ plan.coverageStart ?? "N/A" }}</li>
      <li><strong>Coverage End:</strong> {{ plan.coverageEnd ?? "N/A" }}</li>
      <li><strong>Network Type:</strong> {{ plan.networkType ?? "N/A" }}</li>
      <li><strong>Primary Care Required:</strong> {{ plan.primaryCareRequired ? "Yes" : "No" }}</li>
      <li><strong>Referral Required:</strong> {{ plan.referralRequired ? "Yes" : "No" }}</li>
      <li><strong>Out-of-Network Coverage:</strong> {{ plan.outOfNetwork ? "Yes" : "No" }}</li>
    </ul>

    <p v-else class="text-gray-500 dark:text-gray-400">No plan details available for this user.</p>

    <div v-if="props.mock">
      <!-- Props Table -->
      <h3 class="font-bold mt-6 mb-2">Props</h3>
      <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 dark:bg-[#3a4934]">
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Prop</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Type</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Default</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in propsMeta" :key="p.name">
            <td class="border border-gray-300 px-4 py-2 font-mono">{{ p.name }}</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">{{ p.type }}</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">{{ p.default }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ p.description }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Functions Table -->
      <h3 class="font-bold mt-6 mb-2">Functions</h3>
      <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 dark:bg-[#3a4934]">
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Function</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Parameters</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Returns</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in functionsMeta" :key="f.name">
            <td class="border border-gray-300 px-4 py-2 font-mono">{{ f.name }}</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">{{ f.parameters }}</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">{{ f.returns }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ f.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>
