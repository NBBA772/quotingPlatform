<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Individual and Families</h2>

    <!-- Loading / Error States -->
    <div v-if="loadingLeads" class="text-gray-500 dark:text-gray-300">
      Loading…
    </div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>
    <div v-else-if="leads.length === 0" class="text-gray-500 dark:text-gray-300">
      No individuals or families yet.
    </div>

    <!-- Table -->
    <table v-else class="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <tbody>
        <template v-for="lead in leads" :key="lead.id">
          <!-- Company header row -->
          <tr class="bg-gray-200 dark:bg-[#243021]">
            <td colspan="6" class="p-3 font-bold dark:text-white">
              {{ lead.employees[0]?.lastName }} {{ isFamilyGroup(lead) ? 'Family' : 'Individual' }}
              <span class="text-gray-500 dark:text-gray-400">
                - Assigned to: {{ lead.agent?.firstName }} {{ lead.agent?.lastName }}
              </span>
            </td>
          </tr>

          <!-- Employees -->
          <tr
            v-for="employee in lead.employees"
            :key="`lead-${lead.id}-emp-${employee.id}`"
            class="hover:bg-gray-50 dark:hover:bg-[#2d3a2a]"
          >
            <td class="relative w-8">
              <div class="absolute left-1/2 top-0 bottom-0 border-l-2 border-gray-400 dark:border-gray-400"></div>
            </td>
            <td class="p-2 dark:text-white">
              <div class="flex items-center">
                <div class="w-4 border-t-2 border-gray-400 dark:border-gray-400 mr-2"></div>
                <button
                  type="button"
                  class="hover:text-blue-500 dark:hover:text-green-400 hover:underline"
                  @click="employeeOpenModal(employee)"
                >
                  {{ employee.firstName }} {{ employee.lastName }}
                </button>
              </div>
            </td>
            <td class="p-2 dark:text-white">{{ employee.email }}</td>
            <td class="p-2 dark:text-white">{{ employee.phone || "—" }}</td>
            <td class="p-2 dark:text-white">—</td>
            <td class="p-2 dark:text-white">
              <div class="flex items-center gap-2">
                <span v-if="employee.hasSigned" class="text-green-600 dark:text-green-400 font-semibold">
                  Signed
                </span>
                <div v-else>
                    <button
                      v-if="!employee.hasSignedApplication"
                      @click="employeeOpenModal(employee)"
                      class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Application
                    </button>
                    <button
                      v-if="!employee.hasSignedApplication"
                      @click="startEnrollment(employee)"
                      class="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Enroll
                    </button>
                    <div v-else class="text-green-600 dark:text-red-400 font-semibold">
                      Application Signed
                    </div>
                </div>
                <button
                  class="text-red-600 hover:text-red-800 ml-auto"
                  title="Delete enrollee permanently"
                  @click="permanentDeleteEnrollee(lead, employee)"
                >
                  <Icon name="mdi:delete-forever" size="20" />
                </button>
              </div>
            </td>
          </tr>



        </template>
      </tbody>
    </table>

    <!-- Modal -->
    <Transition name="fade-zoom">
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white dark:bg-[#3a4934] rounded-xl shadow-lg p-6 w-3/4 max-h-[100vh] overflow-y-auto">
          <InsuranceProductForm
            v-if="userId !== null && selectedLead.application !== undefined"
            :key="userId + '-' + (selectedLead.application?.id || 'new')"
            :userId="userId"
            :application="selectedLead.application"
          />

          <p v-else class="text-gray-500 dark:text-gray-400 mt-2">Loading user info...</p>

          <button
            class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const leads = ref<any[]>([]);
const loadingLeads = ref(true);
const error = ref<string | null>(null);

const selectedLead = ref<any | null>(null);
const showModal = ref(false);
const userId = ref<number | null>(null);

// Fetch leads from accepted endpoint 
const fetchLeads = async () => {
  try {
    const res = await $fetch("/api/leads/accepted", {
      method: "GET",
      query: { enrollmentType: "individual" },
    });
    
    // The employees array now includes the hasSigned property from the backend
    leads.value = res.assigned || [];
    
  } catch (err: any) {
    error.value = err.message || "Failed to fetch leads";
  } finally {
    loadingLeads.value = false;
  }
};


const getUserIdByEmail = async (email: string): Promise<number | null> => {
  try {
    const user = await $fetch("/api/user/get-by-email", {
      method: "POST",
      body: { email },
    });
    return user.id || null;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
};

const employeeOpenModal = async (employee: any) => {
  selectedLead.value = { ...employee, application: undefined };
  showModal.value = true;

  userId.value = await getUserIdByEmail(employee.email);
  if (!userId.value) {
    selectedLead.value.application = null;
    return;
  }

  const existingApp = await $fetch(`/api/applications/${userId.value}`).catch(() => null);
  selectedLead.value.application = existingApp?.userId === userId.value ? existingApp : null;
};

const startEnrollment = async (employee: any) => {
  const targetUserId = await getUserIdByEmail(employee.email);
  if (!targetUserId) {
    alert("No user account found for this employee's email.");
    return;
  }
  await navigateTo(`/enroll/${targetUserId}/applicant`);
};

// Family plan when any member's application includes a spouse or dependents
const isFamilyGroup = (lead: any) =>
  (lead.employees || []).some((e: any) => e.hasFamily);

const closeModal = () => {
  selectedLead.value = null;
  userId.value = null;
  showModal.value = false;
};

const permanentDeleteEnrollee = async (lead: any, employee: any) => {
  if (!confirm(`PERMANENTLY delete ${employee.firstName} ${employee.lastName}? This removes their account and all their data and cannot be undone.`)) return;
  try {
    await $fetch(`/api/employee/${employee.id}/permanent`, { method: "DELETE" });
    lead.employees = (lead.employees || []).filter((e: any) => e.id !== employee.id);
  } catch (err: any) {
    console.error("Error deleting enrollee:", err);
    alert(err?.data?.statusMessage || "Failed to delete enrollee");
  }
};

onMounted(fetchLeads);
</script>

<style scoped>
</style>
