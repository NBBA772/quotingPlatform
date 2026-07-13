<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Cookies from "js-cookie";
import axios from "axios";

interface Benefit {
  name: string;
  description: string;
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

const benefits = ref<Benefit[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Demo benefits for mock mode
const demoBenefits: Benefit[] = [
  { name: "Dental Coverage", description: "Covers 80% of dental procedures." },
  { name: "Vision Coverage", description: "Annual eye exam and 1 pair of glasses." },
  { name: "Prescription Drugs", description: "Covers most generic medications." },
];

const fetchBenefits = async () => {
  loading.value = true;
  error.value = null;

  // Use fake data if mock=true and no userId
  if (props.mock && !props.userId) {
    // simulate async fetch
    await new Promise((r) => setTimeout(r, 200)); // optional delay
    benefits.value = [...demoBenefits];
    loading.value = false;
    return;
  }

  if (!props.userId) {
    benefits.value = [];
    loading.value = false;
    return;
  }

  try {
    const token = Cookies.get("auth_token");
    if (!token) throw new Error("Missing auth token");

    const response = await axios.get(`/api/user/${props.userId}/plan-benefits`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    benefits.value = response.data?.benefits || [];
  } catch (err) {
    console.error("❌ Failed to fetch plan benefits", err);
    error.value = "Failed to load plan benefits.";
  } finally {
    loading.value = false;
  }
};


onMounted(fetchBenefits);
watch(() => props.userId, fetchBenefits);

// --- Documentation metadata ---
const propsMeta = [
  { name: "userId", type: "number | null", default: "null", description: "The ID of the user whose plan benefits will be displayed." },
  { name: "mock", type: "boolean", default: "false", description: "If true and no userId, displays demo benefits; otherwise fetches from API." },
];

const functionsMeta = [
  { name: "fetchBenefits", parameters: "none", returns: "Promise<void>", description: "Fetches plan benefits for the user if mock is false or userId exists; otherwise loads demo benefits." },
];
</script>

<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="plan-benefit-display bg-white dark:bg-[#142610] rounded-lg p-4 my-4 shadow">
      <h2 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Plan Benefits</h2>

      <EmployeePlanBenefitsSkeletonLoader v-if="loading && !props.mock" />

      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <ul v-else-if="benefits.length" class="space-y-2">
        <li
          v-for="(benefit, index) in benefits"
          :key="index"
          class="p-3 border rounded-lg bg-gray-50 dark:bg-[#3a4934]"
        >
          <p class="text-gray-900 dark:text-gray-100 font-medium">{{ benefit.name }}</p>
          <p class="text-sm text-white dark:text-gray-300">{{ benefit.description }}</p>
        </li>
      </ul>
      <p v-else class="text-gray-500 dark:text-gray-400">No benefits available for this plan.</p>

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
