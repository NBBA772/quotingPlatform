<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <button
        @click="exportCSV"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition"
      >
        Export Employees CSV
      </button>
    </div>

    <!-- Props & Functions Tables -->
    <div v-if="props.mock" class="mt-4">
      <h3 class="font-bold mb-2">Props</h3>
      <table class="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100 dark:bg-[#142610]">
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
        <thead class="bg-gray-100 dark:bg-[#142610]">
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
import Cookies from "js-cookie";
import { withDefaults, defineProps } from "vue";

// Props
const props = withDefaults(
  defineProps<{
    mock?: boolean;
    userId?: number;
  }>(),
  { mock: false }
);

// Fake CSV export for mock mode
const exportCSV = async () => {
  if (props.mock) {
    // Simulate CSV download
    const csvContent = `Name,Email,Status
Alice Johnson,alice@example.com,active
Bob Smith,bob@example.com,deleted
Charlie Davis,charlie@example.com,active`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Actual API call if mock=false
  if (!props.userId) {
    alert("No userId provided. Cannot export CSV.");
    return;
  }

  try {
    const authToken = Cookies.get("auth_token");
    if (!authToken) throw new Error("No auth token found");

    const response = await $fetch("/api/company/employees-csv", {
      method: "GET",
      responseType: "blob",
    });

    const blob = new Blob([response], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    alert("Failed to export CSV");
  }
};

// --- Documentation metadata ---
const propsMeta = [
  { name: "mock", type: "boolean", default: "false", description: "If true, uses fake CSV data instead of calling the API." },
  { name: "userId", type: "number | undefined", default: "undefined", description: "User ID required for API CSV export." },
];

const functionsMeta = [
  { name: "exportCSV", parameters: "none", returns: "Promise<void>", description: "Exports employees CSV; uses demo data if mock=true, otherwise calls API with auth token." },
];
</script>
