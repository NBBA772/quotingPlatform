<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

interface ClaimSupport {
  id: number;
  userId?: number;
  type: string;
  paidAmount: number;
  maxCoverage?: number;
  phone?: string;
  email?: string;
  portalUrl?: string;
  officeHours?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

const claims = ref<ClaimSupport[]>([]);
const loading = ref(false);

// Demo claims for mock mode
const demoClaims: ClaimSupport[] = [
  {
    id: 1,
    type: "Health",
    paidAmount: 250,
    maxCoverage: 1000,
    phone: "1-800-HEALTH",
    email: "health-support@example.com",
    portalUrl: "https://health.example.com",
    officeHours: "Mon-Fri 9am-5pm",
  },
  {
    id: 2,
    type: "Dental",
    paidAmount: 150,
    maxCoverage: 500,
    phone: "1-800-DENTAL",
    email: "dental-support@example.com",
    portalUrl: "https://dental.example.com",
    officeHours: "Mon-Fri 8am-4pm",
  },
];

const fetchClaims = async () => {
  if (props.mock) {
    claims.value = [...demoClaims];
    return;
  }
  if (!props.userId) return;

  loading.value = true;
  try {
    const res = await $fetch(`/api/claims-support/${props.userId}`);
    claims.value = res.supports || [];
  } catch (err) {
    console.error("❌ Failed to fetch claim supports", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchClaims);
watch(() => props.userId, fetchClaims);

// --- Documentation metadata ---
const propsMeta = [
  { name: "userId", type: "number | null", default: "null", description: "The ID of the user whose claims support will be displayed." },
  { name: "mock", type: "boolean", default: "false", description: "If true, displays demo claims without fetching from API." },
];

const functionsMeta = [
  { name: "fetchClaims", parameters: "none", returns: "Promise<void>", description: "Fetches claims support for the user if mock is false; otherwise loads demo claims." },
];
</script>

<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="claims-support p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
      <h2 class="font-bold text-lg mb-2">Claims Support</h2>

      <EmployeeClaimsSupportSkeletonLoader v-if="loading && !props.mock" />

      <ul v-else class="space-y-4">
        <li v-for="claim in claims" :key="claim.id" class="border-b pb-4">
          <div class="mb-1"><strong>Type:</strong> {{ claim.type }}</div>
          <div class="mb-1"><strong>Paid Amount:</strong> ${{ claim.paidAmount }}</div>
          <div class="mb-1"><strong>Max Coverage:</strong> {{ claim.maxCoverage ?? "N/A" }}</div>
          <div class="mb-1"><strong>Phone:</strong> {{ claim.phone ?? "N/A" }}</div>
          <div class="mb-1"><strong>Email:</strong> {{ claim.email ?? "N/A" }}</div>
          <div class="mb-1">
            <strong>Portal:</strong>
            <a v-if="claim.portalUrl" :href="claim.portalUrl" class="text-blue-500" target="_blank" rel="noopener">
              {{ claim.portalUrl }}
            </a>
            <span v-else>N/A</span>
          </div>
          <div class="mb-1"><strong>Office Hours:</strong> {{ claim.officeHours ?? "N/A" }}</div>
        </li>
      </ul>

      <div v-if="!loading && claims.length === 0" class="text-gray-500">
        No claims support found.
      </div>

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
