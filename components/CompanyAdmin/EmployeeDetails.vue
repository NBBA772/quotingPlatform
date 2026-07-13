<template>
  <div class="plan-details p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <!-- Dropdown -->
    <CompanyEmployeeDropdown
      @update:selectedCompany="selectedCompany = $event"
      @update:selectedEmployee="onEmployeeSelect"
      :companyOnly="false"
    />

    <div v-if="employee">
      <h2 class="border-b dark:bg-[#142610] p-4 text-3xl font-bold py-8 mt-12 mb-4 flex justify-between items-center">
        <span>
          {{ capitalize(employee.firstName) }} {{ capitalize(employee.lastName) }}
        </span>
        <span class="text-lg font-semibold text-gray-600 dark:text-gray-300">
          {{ selectedCompany?.companyName }}
        </span>
      </h2>


      <!-- Tab buttons -->
      <div class="flex gap-2 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 rounded-lg transition font-semibold"
          :class="activeTab === tab.key
            ? 'bg-blue-600 dark:bg-[#046937] dark:hover:bg-[#058a45] text-white'
            : 'bg-gray-200 dark:bg-[#142610] hover:bg-gray-300 dark:hover:bg-[#1b3320]'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Animated conditional content -->
      <transition name="fade-slide" mode="out-in">
        <component
          :is="currentComponent"
          :key="activeTab"
          :userId="employee.userId"
          :selectedCompanyId="selectedCompany?.id"
        />
      </transition>

    </div>

    <div v-else-if="!selectedCompany">
      <p>Please select a company.</p>
    </div>
    <div v-else>
      <p>Please select an employee.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CompanyEmployeeDropdown from "~/components/AppAdmin/CompanyEmployeeDropdown.vue";
import InsuranceCard from '~/components/AppAdmin/InsuranceCard.vue';
// import PlanBenefits from '~/components/AppAdmin/PlanBenefits.vue';
// import ProviderNetwork from '~/components/AppAdmin/ProviderNetwork.vue';
// import ClaimsSupport from '~/components/AppAdmin/ClaimsSupport.vue';
// import PlanDetailPage from '~/components/AppAdmin/PlanDetailPage.vue';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  userId: number;
}

interface Company {
  id: number;
  companyName: string;
  // Add other company fields if needed
}

// Props
defineProps<{ employee: Employee | null }>();

// Emits
const emit = defineEmits<{
  (e: 'update:selectedCompany', company: Company | null): void;
  (e: 'update:selectedEmployee', employee: Employee | null): void;
}>();

// Tabs
const activeTab = ref("card");
const tabs = [
  { key: "card", label: "Insurance Card" },
  // { key: "benefits", label: "Benefits" },
  // { key: "network", label: "Network" },
  // { key: "claims", label: "Claims" },
  // { key: "details", label: "Plan Details" },
];

const currentComponent = computed(() => {
  switch (activeTab.value) {
    case "card": return InsuranceCard;
    // case "benefits": return PlanBenefits;
    // case "network": return ProviderNetwork;
    // case "claims": return ClaimsSupport;
    // case "details": return PlanDetailPage;
    default: return InsuranceCard;
  }
});

// Local state
const selectedCompany = ref<Company | null>(null);
const employee = ref<Employee | null>(null);

// Watch for company changes
watch(selectedCompany, (newCompany, oldCompany) => {
  employee.value = null;       // Clear previous employee
  activeTab.value = "card";    // Reset tab to default
});

// When a company is selected
function onCompanySelect(company: Company | null) {
  selectedCompany.value = company;
  employee.value = null; // Clear previous employee
  emit('update:selectedCompany', company);
  emit('update:selectedEmployee', null); // notify parent
}

// When an employee is selected
function onEmployeeSelect(e: Employee) {
  employee.value = e;
  emit('update:selectedEmployee', e);
}

// Capitalize helper
const capitalize = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
</script>
