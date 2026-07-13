<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Companies</h1>

    <!-- Companies Dropdown -->
    <select
      v-model="selectedCompanyId"
      @change="onCompanyChange"
      class="border p-2 rounded w-full mb-4"
    >
      <option value="" disabled>Select a company</option>
      <option
        v-for="company in companies"
        :key="company.id"
        :value="company.id"
      >
        {{ company.companyName }} ({{ company.industry }}) – {{ company.city }}, {{ company.state }}
      </option>
    </select>

    <!-- Employees Dropdown -->
    <div v-if="selectedCompany">
      <h2 class="text-xl font-semibold mb-2">Employees of {{ selectedCompany.companyName }}</h2>

      <select
        v-model="selectedEmployeeId"
        @change="onEmployeeChange"
        class="border p-2 rounded w-full mb-4"
      >
        <option value="" disabled>Select an employee</option>
        <option
          v-for="emp in employees"
          :key="emp.id"
          :value="emp.id"
        >
          {{ emp.firstName }} {{ emp.lastName }} – {{ emp.email }} – {{ emp.phone || 'No phone' }}
        </option>
      </select>
    </div>

    <!-- Show details for selected employee -->
    <div v-if="selectedEmployee">
      <InsuranceCard :userId="selectedEmployee.userId" />
      <PlanBenefits :userId="selectedEmployee.userId" />
      <ProviderNetwork :userId="selectedEmployee.userId" />
      <ClaimsSupport :userId="selectedEmployee.userId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import InsuranceCard from '~/components/AppAdmin/InsuranceCard.vue';
import PlanBenefits from '~/components/AppAdmin/PlanBenefits.vue';
import ProviderNetwork from '~/components/AppAdmin/ProviderNetwork.vue';
import ClaimsSupport from '~/components/AppAdmin/ClaimsSupport.vue';

interface Company {
  id: number;
  companyName: string;
  industry: string;
  city: string;
  state: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username: string;
  userId: number; // make sure this exists
}

const companies = ref<Company[]>([]);
const employees = ref<Employee[]>([]);
const selectedCompanyId = ref<number | null>(null);
const selectedEmployeeId = ref<number | null>(null);

const selectedCompany = computed(() =>
  companies.value.find(c => c.id === selectedCompanyId.value) || null
);

const selectedEmployee = computed(() =>
  employees.value.find(e => e.id === selectedEmployeeId.value) || null
);

const fetchCompanies = async () => {
  try {
    companies.value = await $fetch('/api/companies');
  } catch (err) {
    console.error('Failed to fetch companies', err);
  }
};

const fetchEmployees = async (companyId: number) => {
  try {
    employees.value = await $fetch(`/api/companies/${companyId}/employees`);
  } catch (err) {
    console.error('Failed to fetch employees', err);
    employees.value = [];
  }
};

const onCompanyChange = async () => {
  if (selectedCompanyId.value !== null) {
    selectedEmployeeId.value = null;
    await fetchEmployees(selectedCompanyId.value);
  }
};

const onEmployeeChange = () => {
  // selectedEmployee is automatically updated via computed
};

onMounted(fetchCompanies);
</script>
