<template>
  <PatternSection>
    <div>
      <!-- Show skeleton while loading -->
      <DashboardSkeleton v-if="loading" />

      <template v-else>
        <!-- <h1 class="text-2xl text-center font-bold mb-4 pt-4">
          {{
            isAppAdmin
              ? "App Admin Dashboard"
              : isCompanyAdmin
              ? "Company Admin Dashboard"
              : isInsuranceAgent
              ? "Insurance Agent Dashboard"
              : "Employee Dashboard"
          }}
        </h1> -->


        <AppAdminDashboard v-if="isAppAdmin" />
        <CompanyAdminDashboard v-else-if="isCompanyAdmin" />
        <EmployeeDashboard v-else-if="isEmployee" />
        <InsuranceAgentDashboard v-else-if="isInsuranceAgent" />
      </template>
    </div>
  </PatternSection>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthCookie } from "~/composables/useAuth";
import { useAppAdmin } from "~/composables/useAppAdmin";
import { useCompanyAdmin } from "~/composables/useCompanyAdmin";

const loggedInUser = ref<any>(null);
const authCookie = useAuthCookie();

const isAppAdmin = ref(false);
const isCompanyAdmin = ref(false);

const isEmployee = ref(false)
const isInsuranceAgent = ref(false)
const loading = ref(true);

async function getLoggedInUser() {
  try {
    if (!authCookie.value) return;

    const response = await $fetch("/api/user", {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    });

    loggedInUser.value = response.user || response;
console.log("loggedInUser.value.id ", loggedInUser.value.id)
    if (loggedInUser.value?.id) {
      isAppAdmin.value = await useAppAdmin(loggedInUser.value.id)
      isCompanyAdmin.value = await useCompanyAdmin(loggedInUser.value.id)
      isEmployee.value = await useEmployee(loggedInUser.value.id)
      isInsuranceAgent.value = await useInsuranceAgent(loggedInUser.value.id)
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  } finally {
    loading.value = false; // ✅ only stop loading after roles are resolved
  }
}

onMounted(getLoggedInUser);
</script>
