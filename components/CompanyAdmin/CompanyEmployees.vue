<template>
  <div class="plan-details p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="grid grid-cols-1 lg:grid-cols-3 md:grid-col-1 gap-4 mb-4">
      <BusinessCodeCopy :code="props.businessCode" />
      <RegistrationStats />
      <CoverageSummary />
    </div>

    <!-- Header + Actions -->
    <div class="flex justify-between items-center mb-4 relative">
      <h2 class="text-xl font-semibold">Company Employees</h2>

      <!-- Actions Button -->
      <div class="relative">
        <button
          @click="menuOpen = !menuOpen"
          class="bg-gray-200 dark:bg-[#142610] px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-[#058a45] transition"
        >
          Actions
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-56 bg-white dark:bg-[#142610] border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10"
        >
          <button
            @click="openInvite"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
          >
            Invite Employee
          </button>
          <button
            @click="openMassInvite"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
          >
            Mass Invite Employees
          </button>
          <button
            @click="showActive"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
          >
            Show Active Employees
          </button>
          <button
            @click="showDeleted"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
          >
            Show Deleted Employees
          </button>
          <button
            @click="exportCSV"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
          >
            Export Employees CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Conditional rendering -->
    <InviteEmployee v-if="viewMode === 'invite'" @close="viewMode = 'active'" />
    <MassInviteEmployees v-else-if="viewMode === 'massInvite'" @close="viewMode = 'active'" />
    <ActiveCompanyEmployees v-else-if="viewMode === 'active'" />
    <DeletedEmployees v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InviteEmployee from "./InviteEmployee.vue";
import MassInviteEmployees from "./MassInviteEmployees.vue";
import ActiveCompanyEmployees from "./ActiveCompanyEmployees.vue";
import DeletedEmployees from "./DeletedEmployees.vue";

const props = defineProps<{
  businessCode: string | null
}>();


const viewMode = ref<"active" | "deleted" | "invite" | "massInvite">("active");
const menuOpen = ref(false);

const openInvite = () => {
  viewMode.value = "invite";
  menuOpen.value = false;
};

const openMassInvite = () => {
  viewMode.value = "massInvite";
  menuOpen.value = false;
};

const showActive = () => {
  viewMode.value = "active";
  menuOpen.value = false;
};

const showDeleted = () => {
  viewMode.value = "deleted";
  menuOpen.value = false;
};

const exportCSV = async () => {
  try {
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
    menuOpen.value = false;
  } catch (err) {
    console.error(err);
    alert("Failed to export CSV");
  }
};
</script>

<style scoped>
button:focus {
  outline: none;
}
</style>
