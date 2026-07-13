<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <!-- Dropdown for company selection -->
    <CompanyEmployeeDropdown
      @update:selectedCompany="onCompanySelect"
      :companyOnly="true"
    />

    <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      Inactive Employees
    </h2>

    <!-- Show message before company selection -->
    <div v-if="!selectedCompany" class="text-gray-500 dark:text-gray-400">
      Please select a company to view inactive employees.
    </div>

    <!-- Skeleton Loader -->
    <AppAdminInactiveEmployeesSkeleton v-else-if="loading" :rows="6" />

    <!-- Employees list -->
    <div v-else>
      <div v-if="employees.length === 0" class="text-gray-500 dark:text-gray-400">
        No inactive employees found.
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="employee in employees"
          :key="employee.id"
          :class="[
            'p-3 bg-white dark:bg-[#142610] dark:hover:bg-[#1b3320] shadow rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center transition-transform',
            { removing: removingIds.has(employee.id) }
          ]"
        >
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-200">
              {{ employee.firstName }} {{ employee.lastName }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ employee.email }}</p>
          </div>

          <!-- Restore button -->
          <button
            @click="restoreEmployee(employee.id)"
            class="bg-green-500 dark:bg-[#046937] dark:hover:bg-[#058a45] text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Restore
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import CompanyEmployeeDropdown from "~/components/AppAdmin/CompanyEmployeeDropdown.vue";

const employees = ref([]);
const loading = ref(true);
const removingIds = ref(new Set()); // track which are being restored
const selectedCompany = ref(null);

// Fetch inactive employees
const fetchInactiveEmployees = async () => {
  if (!selectedCompany.value) return; // don't fetch until a company is selected

  loading.value = true;
  try {
    const { data } = await axios.get("/api/employee/inActiveEmployee", {
      params: { isActive: false, companyId: selectedCompany.value.id },
    });
    employees.value = data;
  } catch (err) {
    console.error("Error fetching inactive employees", err);
    employees.value = [];
  } finally {
    loading.value = false;
  }
};

// Restore an employee (with animation)
const restoreEmployee = async (id) => {
  if (!confirm("Are you sure you want to restore this employee?")) return;

  removingIds.value.add(id);

  const ANIM_MS = 650;
  await new Promise((res) => setTimeout(res, ANIM_MS));

  try {
    await axios.patch(`/api/employee/${id}/restore`);
    employees.value = employees.value.filter((emp) => emp.id !== id);
  } catch (err) {
    console.error("Error restoring employee", err);
    removingIds.value.delete(id); // rollback if error
  }
};

// Handle company selection from dropdown
const onCompanySelect = (company) => {
  selectedCompany.value = company;
  fetchInactiveEmployees();
};

onMounted(fetchInactiveEmployees);
</script>
