<template>
  <div
    class="coverage-summary border border-gray-200 dark:border-gray-700 shadow p-4 bg-white dark:bg-[#142610] rounded-lg"
  >
    <!-- Heading -->
    <h2 class="text-lg font-bold mb-2">Business Code</h2>

    <!-- Loading State (only if not mock) -->
    <CompanyAdminBusinessCodeCopySkeletonLoader
      v-if="loading && !props.mock"
    />

    <!-- Main Content -->
    <div v-else>
      <!-- Code and Copy Button -->
      <div class="flex items-center gap-4 mb-4">
        <p class="text-3xl font-mono text-blue-600 dark:text-blue-400">
          {{ displayCode }}
        </p>

        <button
          @click="copyCode"
          class="px-6 py-3 bg-gray-200 dark:bg-[#3a4934] hover:bg-gray-300 dark:hover:bg-[#142610]
                rounded-lg transition flex items-center gap-2 text-lg font-semibold
                border border-transparent hover:border-gray-400 dark:hover:border-green-500/40 z-10"
        >
          <Icon name="material-symbols:content-copy-outline" class="w-6 h-6" />
          <span v-if="copied" class="text-green-600 dark:text-green-400">Copied!</span>
        </button>
      </div>

      <!-- Props Table -->
      <div v-if="propsMeta.length && props.mock" class="mt-6">
        <h3 class="text-md font-semibold mb-2">Props</h3>
        <table class="table-auto w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-[#3a4934]">
              <th class="border px-2 py-1 text-left">Name</th>
              <th class="border px-2 py-1 text-left">Type</th>
              <th class="border px-2 py-1 text-left">Default</th>
              <th class="border px-2 py-1 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in propsMeta" :key="p.name">
              <td class="border px-2 py-1">{{ p.name }}</td>
              <td class="border px-2 py-1">{{ p.type }}</td>
              <td class="border px-2 py-1">{{ p.default }}</td>
              <td class="border px-2 py-1">{{ p.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Functions Table -->
      <div v-if="functionsMeta.length && props.mock" class="mt-6">
        <h3 class="text-md font-semibold mb-2">Functions</h3>
        <table class="table-auto w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-[#3a4934]">
              <th class="border px-2 py-1 text-left">Name</th>
              <th class="border px-2 py-1 text-left">Parameters</th>
              <th class="border px-2 py-1 text-left">Returns</th>
              <th class="border px-2 py-1 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in functionsMeta" :key="f.name">
              <td class="border px-2 py-1">{{ f.name }}</td>
              <td class="border px-2 py-1">{{ f.parameters }}</td>
              <td class="border px-2 py-1">{{ f.returns }}</td>
              <td class="border px-2 py-1">{{ f.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CompanyAdminBusinessCodeCopySkeletonLoader from '~/components/SkeletonLoaders/CompanyAdminBusinesCodeCopySkeletonLoader.vue';

const loading = ref(true); // local ref you can toggle
const copied = ref(false);
const mockValue = "123456";

const props = withDefaults(defineProps<{
  code?: string | null;
  mock?: boolean;
}>(), {
  code: null,
  mock: false,
});

const displayCode = computed(() =>
  props.mock ? mockValue : props.code || "N/A"
);

const copyCode = async () => {
  if (!displayCode.value || displayCode.value === "N/A") return;
  try {
    await navigator.clipboard.writeText(displayCode.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error("Failed to copy business code:", err);
  }
};

const propsMeta = [
  { name: "code", type: "string | null", default: "null", description: "The business code to display" },
  { name: "mock", type: "boolean", default: "false", description: "If true, shows a mock code for demo purposes in the documentation" }
];

const functionsMeta = [
  {
    name: "copyCode",
    parameters: "none",
    returns: "Promise<void>",
    description: "Copies the displayed business code to the clipboard and shows 'Copied!' feedback.",
  }
];

// Example: simulate loading for 2 seconds
setTimeout(() => {
  loading.value = false;
}, 2000);
</script>
