<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useAuthCookie } from "~/composables/useAuth";

interface Provider {
  id: number;
  name: string;
  type: string;
  location: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
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

const providers = ref<Provider[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const authCookie = useAuthCookie();

// Demo providers for mock mode
const demoProviders: Provider[] = [
  {
    id: 1,
    name: "Health First Clinic",
    type: "Clinic",
    location: "New York, NY",
    specialty: "General Practice",
    phone: "1-800-HEALTH",
    email: "contact@healthfirst.com",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  },
  {
    id: 2,
    name: "Vision Care Center",
    type: "Optometry",
    location: "Los Angeles, CA",
    specialty: "Eye Care",
    phone: "1-800-VISION",
    email: "info@visioncare.com",
    address: "456 Elm St",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
  },
];

const fetchProviders = async () => {
  loading.value = true;
  error.value = null;

  // Use mock data if mock=true and no userId
  if (props.mock && !props.userId) {
    await new Promise((r) => setTimeout(r, 200)); // simulate async
    providers.value = [...demoProviders];
    loading.value = false;
    return;
  }

  if (!props.userId) {
    providers.value = [];
    loading.value = false;
    return;
  }

  try {
    const token = authCookie.value;
    if (!token) throw new Error("Missing auth token");

    const res = await $fetch(`/api/providers/${props.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    providers.value = res.providers || [];
  } catch (err) {
    console.error("❌ Failed to fetch providers", err);
    error.value = "Failed to load providers.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProviders);
watch(() => props.userId, fetchProviders);

// --- Documentation metadata ---
const propsMeta = [
  { name: "userId", type: "number | null", default: "null", description: "The ID of the user whose providers will be displayed." },
  { name: "mock", type: "boolean", default: "false", description: "If true and no userId, displays demo providers; otherwise fetches from API." },
];

const functionsMeta = [
  { name: "fetchProviders", parameters: "none", returns: "Promise<void>", description: "Fetches provider network for the user if mock is false or userId exists; otherwise loads demo providers." },
];
</script>

<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="provider-network rounded-lg bg-white dark:bg-[#142610] p-4 my-4 shadow">
      <h2 class="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Provider Network</h2>

      <EmployeeProviderNetworkSkeletonLoader v-if="loading && !props.mock" />

      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <ul v-else-if="providers.length" class="space-y-4 text-gray-800 dark:text-gray-200">
        <li v-for="provider in providers" :key="provider.id" class="border-b pb-4">
          <div class="flex justify-between items-center">
            <strong class="text-lg">{{ provider.name }}</strong>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ provider.type }}</span>
          </div>
          <div class="mt-1">
            <div v-if="provider.specialty"><strong>Specialty:</strong> {{ provider.specialty }}</div>
            <div v-if="provider.phone"><strong>Phone:</strong> {{ provider.phone }}</div>
            <div v-if="provider.email"><strong>Email:</strong> {{ provider.email }}</div>
            <div v-if="provider.address || provider.city || provider.state || provider.zipCode">
              <strong>Address:</strong>
              {{ provider.address ? provider.address + "," : "" }}
              {{ provider.city ? provider.city + "," : "" }}
              {{ provider.state ? provider.state + "," : "" }}
              {{ provider.zipCode || "" }}
            </div>
            <div v-if="provider.location"><strong>Location:</strong> {{ provider.location }}</div>
          </div>
        </li>
      </ul>

      <p v-else class="text-gray-500 dark:text-gray-400">No providers available for this user.</p>

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
