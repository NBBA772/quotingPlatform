<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";

interface ClaimSupport {
  id?: number;
  type: string;
  paidAmount?: number;
  maxCoverage?: number;
  phone?: string;
  email?: string;
  portalUrl?: string;
  officeHours?: string;
}

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

const localSupports = ref<ClaimSupport[]>([]);
const loading = ref(false);


// default mock dataset
const defaultMockSupports: ClaimSupport[] = [
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

const fetchSupports = async () => {
  if (props.mock) {
    // start with mock dataset
    localSupports.value = [...defaultMockSupports];
    return;
  }

  if (!props.userId) return;
  loading.value = true;
  try {
    const res = await $fetch(`/api/claims-support/${props.userId}`);
    localSupports.value = res.supports || [];
  } catch (err) {
    console.error("Failed to fetch claim supports", err);
  } finally {
    loading.value = false;
  }
};

const addSupport = () =>
  localSupports.value.push({ type: "", paidAmount: 0, maxCoverage: 0 });

const removeSupport = (index: number) => localSupports.value.splice(index, 1);

const saveSupports = async () => {
  if (props.mock) {
    console.log("Mock save:", localSupports.value);
    alert("✅ Mock: Claim supports saved successfully");
    return;
  }
  if (!props.userId) return;

  try {
    const res = await fetch(`/api/claims-support/${props.userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localSupports.value),
    });
    const data = await res.json();
    localSupports.value = data.supports;
    alert("✅ Claim supports saved successfully");
  } catch (err) {
    console.error("Failed to save claim supports", err);
    alert("❌ Failed to save claim supports");
  }
};

onMounted(fetchSupports);
watch(() => props.userId, fetchSupports);

// --- Props metadata for table ---
const propsMeta = [
  {
    name: "userId",
    type: "number | null",
    default: "null",
    description: "ID of the user whose claim supports are being managed. Required in real mode."
  },
  {
    name: "mock",
    type: "boolean",
    default: "false",
    description: "If true, runs in mock/demo mode with editable local claim supports."
  }
];

// --- Functions metadata for table ---
const functionsMeta = [
  {
    name: "fetchSupports",
    description: "Fetches claim supports for the given user, or initializes with mock data when in mock mode.",
    parameters: "none",
    returns: "Promise<void>",
    sideEffects: "Populates `localSupports` with either API or mock claim supports."
  },
  {
    name: "addSupport",
    description: "Adds a blank support object to the list for user input.",
    parameters: "none",
    returns: "void",
    sideEffects: "Mutates `localSupports` by appending a new support entry."
  },
  {
    name: "removeSupport",
    description: "Removes a support entry at the given index.",
    parameters: "index: number",
    returns: "void",
    sideEffects: "Mutates `localSupports` by removing the selected entry."
  },
  {
    name: "saveSupports",
    description: "Saves the current list of claim supports to the backend, or simulates save in mock mode.",
    parameters: "none",
    returns: "Promise<void>",
    sideEffects: "Persists changes to API (real mode) or logs/alerts (mock mode). Updates `localSupports` with API response in real mode."
  }
];

</script>

<template>
  <div class="claims-support p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
    <h2 class="font-bold text-lg mb-2">
      Claims Support ({{ mock ? "Mock" : "Edit" }})
    </h2>

    <div v-if="loading && !mock">
      <AppAdminClaimSupportSkeletonLoader />
    </div>


    <!-- Shared list (real or mock) -->
    <ul v-else class="space-y-2">
      <li
        v-for="(support, index) in localSupports"
        :key="support.id || index"
        class="flex flex-col gap-2 border-b pb-2"
      >
        <input v-model="support.type" placeholder="Claim Type (Health, Dental)"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />

        <input v-model.number="support.paidAmount" placeholder="Paid Amount"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />

        <input v-model.number="support.maxCoverage" placeholder="Max Coverage"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />

        <input v-model="support.phone" placeholder="Phone"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />

        <input v-model="support.email" placeholder="Email"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />

        <input v-model="support.portalUrl" placeholder="Portal URL"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />

        <input v-model="support.officeHours" placeholder="Office Hours"
          class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200" />
  <button type="button" @click="removeSupport(index)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm transition-all duration-200 mt-2">Remove</button>
      </li>
    </ul>

    <!-- Action buttons (work in both real + mock mode) -->
    <div class="mt-4 flex gap-3">
      <button type="button" @click="addSupport" class="px-4 py-2 bg-gray-200 dark:bg-[#3a4934] rounded hover:bg-gray-300 dark:hover:bg-[#1b3320] transition">Add Claim</button>
      <button
        type="button"
        @click="saveSupports"
        :disabled="!mock && !props.userId"
        class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bg-[#058a45]"
      >
        Save
      </button>
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
          <tr>
            <td class="border border-gray-300 px-4 py-2 font-mono">userId</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">number | null</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">null</td>
            <td class="border border-gray-300 px-4 py-2">
              The ID of the user whose claim supports are being fetched or edited.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 font-mono">mock</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">boolean</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">false</td>
            <td class="border border-gray-300 px-4 py-2">
              If true, renders mock claim supports instead of fetching from the API.
            </td>
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
          <tr>
            <td class="border border-gray-300 px-4 py-2 font-mono">fetchSupports</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">none</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">Promise&lt;void&gt;</td>
            <td class="border border-gray-300 px-4 py-2">
              Fetches claim supports from the API if <code>mock</code> is false and <code>userId</code> is provided; otherwise, populates mock data.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 font-mono">addSupport</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">none</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">void</td>
            <td class="border border-gray-300 px-4 py-2">
              Adds a new empty claim support object to the local list.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 font-mono">removeSupport</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">index: number</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">void</td>
            <td class="border border-gray-300 px-4 py-2">
              Removes the claim support at the given index from the local list.
            </td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2 font-mono">saveSupports</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">none</td>
            <td class="border border-gray-300 px-4 py-2 font-mono">Promise&lt;void&gt;</td>
            <td class="border border-gray-300 px-4 py-2">
              Saves the current claim supports to the API if <code>mock</code> is false and <code>userId</code> exists; otherwise, logs the mock save.
            </td>
          </tr>
        </tbody>
      </table>
    </div>


  </div>
</template>
