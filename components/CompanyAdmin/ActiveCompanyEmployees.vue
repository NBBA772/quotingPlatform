<template>
  <div class="mx-auto py-4">

    <div v-if="!isCompanyAdmin">You do not have permission to view employees.</div>

    <!-- Show skeleton while loading -->
    <EmployeeSkeleton v-else-if="loading" />

    <!-- Show empty message if no employees -->
    <div v-else-if="employees.length === 0" class="text-white">
      No employees found for this company.
    </div>

    <!-- Draggable list -->
    <draggable
      v-else
      v-model="employees"
      handle=".drag-handle"
      item-key="id"
      tag="ul"
      @end="onReorder"
    >
      <template #item="{ element: employee }">
        <li
          :key="employee.id"
          :class="[
            'p-3 mb-4 bg-white dark:bg-[#142610] dark:hover:bg-[#1b3320] shadow rounded-lg border border-gray-200 dark:border-gray-700 flex items-center transition-transform',
            { removing: removingIds.has(employee.id) }
          ]"
        >
          <!-- Left: drag handle + name/email -->
          <div class="flex items-center space-x-2 w-1/3 min-w-[120px]">
            <span class="drag-handle cursor-grab text-gray-400 select-none">☰</span>
            <div>
              <p class="font-semibold">{{ employee.firstName }} {{ employee.lastName }}</p>
              <p class="text-sm text-gray-500">{{ employee.email }}</p>
            </div>
          </div>

          <!-- Center: Status icons -->
          <div class="flex items-center justify-center space-x-3 w-1/3">
            <Icon
              :name="employee.status?.hasPlanBenefits ? 'mdi:clipboard-text-outline' : 'mdi:clipboard-text-off-outline'"
              :class="employee.status?.hasPlanBenefits ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Plan Benefits"
            />
            <Icon
              :name="employee.status?.hasProviderNetwork ? 'mdi:network-outline' : 'mdi:network-off-outline'"
              :class="employee.status?.hasProviderNetwork ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Provider Network"
            />
            <Icon
              :name="employee.status?.hasClaimsSupport ? 'mdi:file-document-outline' : 'mdi:file-cancel-outline'"
              :class="employee.status?.hasClaimsSupport ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Claims Support"
            />
            <Icon
              :name="employee.status?.hasPlanDetails ? 'mdi:information-outline' : 'mdi:information-off-outline'"
              :class="employee.status?.hasPlanDetails ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Plan Details"
            />
            <Icon
              :name="employee.status?.hasInsuranceCard ? 'mdi:credit-card-outline' : 'mdi:credit-card-off-outline'"
              :class="employee.status?.hasInsuranceCard ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Insurance Card"
            />
            <Icon
              name="mdi:tooth-outline"
              :class="employee.status?.hasDentalCard ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Dental Card"
            />
            <Icon
              :name="employee.status?.hasVisionCard ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              :class="employee.status?.hasVisionCard ? 'text-green-500' : 'text-gray-400'"
              size="20"
              title="Vision Card"
            />
          </div>

          <!-- Right: trash button -->
          <div class="flex justify-end w-1/3 min-w-[60px]">
            <button
              class="text-red-500 hover:text-red-700"
              @click="confirmRemove(employee.id)"
              title="Remove Employee"
            >
              <Icon name="mdi:trash-can-outline" size="20" />
            </button>
          </div>
        </li>
      </template>
    </draggable>
    <!-- Props Table -->
    <div v-if="propsMeta.length && props.mock" class="mt-6">
      <h3 class="text-md font-semibold mb-2">Props</h3>
      <table class="table-auto w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 dark:bg-[#142610]">
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
          <tr class="bg-gray-100 dark:bg-[#142610]">
            <th class="border px-2 py-1 text-left">Name</th>
            <th class="border px-2 py-1 text-left">Parameters</th>
            <th class="border px-2 py-1 text-left">Returns</th>
            <th class="border px-2 py-1 text-left">Description</th>
            <th class="border px-2 py-1 text-left">Side Effects / Endpoints</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in functionsMeta" :key="f.name">
            <td class="border px-2 py-1">{{ f.name }}</td>
            <td class="border px-2 py-1">{{ f.parameters }}</td>
            <td class="border px-2 py-1">{{ f.returns }}</td>
            <td class="border px-2 py-1">{{ f.description }}</td>
            <td class="border px-2 py-1">{{ f.sideEffects }}</td>
          </tr>
        </tbody>
      </table>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCookie } from "#imports";
import draggable from "vuedraggable";

const props = defineProps<{ mock?: boolean }>();

const employees = ref<any[]>([]);
const loading = ref(false);
const user = ref<any>(null);
const isCompanyAdmin = ref(false);
const removingIds = ref(new Set<number>());

const authToken = useCookie("auth_token").value;

// mock mode
if (props.mock) {
  employees.value = [
    { id: 1, firstName: "Jane", lastName: "Doe", email: "jane@example.com", status: { hasPlanBenefits: true } },
    { id: 2, firstName: "John", lastName: "Smith", email: "john@example.com", status: { hasProviderNetwork: true } }
  ];
  isCompanyAdmin.value = true;
  loading.value = false;
}

// --- Fetch user / employees ---
const fetchUser = async () => {
  if (!authToken) return;
  try {
    const res = await $fetch("/api/user", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    user.value = res.user || res;
    isCompanyAdmin.value = !!user.value?.companyAdminId;
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

const fetchEmployeeStatus = async (employee: any) => {
  try {
    const planRes = await $fetch(`/api/employee/${employee.id}/plan-status`, { headers: { Authorization: `Bearer ${authToken}` } });
    const networkRes = await $fetch(`/api/employee/${employee.id}/provider-network-status`, { headers: { Authorization: `Bearer ${authToken}` } });
    const claimsRes = await $fetch(`/api/employee/${employee.id}/claim-support`, { headers: { Authorization: `Bearer ${authToken}` } });
    const planDetailsRes = await $fetch(`/api/employee/${employee.id}/plan-details`, { headers: { Authorization: `Bearer ${authToken}` } });
    const cardsRes: any = await $fetch(`/api/employee/${employee.id}/insurance-cards`, {
  headers: { Authorization: `Bearer ${authToken}` },
});

// Make sure it's an array
const cards: any[] = Array.isArray(cardsRes?.insuranceCards) ? cardsRes.insuranceCards : [];

const healthCard = cards.find(c => c.type === "Health");
const dentalCard = cards.find(c => c.type === "Dental");
const visionCard = cards.find(c => c.type === "Vision");

employee.status = {
  ...employee.status,
   hasPlanBenefits: planRes.hasPlanBenefits,
   hasProviderNetwork: networkRes.hasProviderNetwork,
   hasClaimsSupport: claimsRes.hasClaimsSupport,
   planDetails: planDetailsRes.planDetails || [],
  hasInsuranceCard: !!healthCard,
  hasDentalCard: !!dentalCard,
  hasVisionCard: !!visionCard,
  insuranceCardImage: healthCard?.imageUrl || null,
  dentalCardImage: dentalCard?.imageUrl || null,
  visionCardImage: visionCard?.imageUrl || null,
};

  } catch (err) {
    console.error("Error fetching status for employee", employee.id, err);
  }
};

const fetchEmployees = async () => {
  if (!authToken) return;
  loading.value = true;
  try {
    const res = await $fetch("/api/company/employees", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    employees.value = (res || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await Promise.all(employees.value.map(fetchEmployeeStatus));
  } catch (err: any) {
    console.error("Error fetching employees:", err);
  } finally {
    loading.value = false;
  }
};

// --- Confirm + animate, then delete ---
const confirmRemove = async (employeeId: number) => {
  if (props.mock) {
    employees.value = employees.value.filter((e) => e.id !== employeeId);
    return;
  }
  if (!authToken) return;
  if (!confirm("Are you sure you want to remove this employee?")) return;

  removingIds.value.add(employeeId);
  const ANIM_MS = 650;
  await new Promise((res) => setTimeout(res, ANIM_MS));

  try {
    await $fetch(`/api/employee/${employeeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    employees.value = employees.value.filter((e) => e.id !== employeeId);
  } catch (err) {
    console.error("Error deleting employee:", err);
    removingIds.value.delete(employeeId);
    alert("Failed to delete employee. See console for details.");
  }
};

// --- Reorder handler ---
const onReorder = async () => {
  if (props.mock) return;
  if (!authToken) return;

  try {
    const payload = employees.value.map((emp, index) => ({ id: emp.id, order: index }));
    await $fetch("/api/employee/reorder", {
      method: "PATCH",
      body: payload,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (err) {
    console.error("Error saving employee order:", err);
  }
};

onMounted(async () => {
  if (props.mock) return;
  await fetchUser();
  if (isCompanyAdmin.value) await fetchEmployees();
});

// --- Props metadata for table ---
const propsMeta = [
  {
    name: "mock",
    type: "boolean",
    default: "false",
    description: "If true, renders mock employees for demo purposes in the documentation"
  }
];

// --- Functions metadata for table ---
const functionsMeta = [
  {
    name: "fetchUser",
    description: "Fetches the authenticated user and sets `isCompanyAdmin` based on user data.",
    parameters: "none",
    returns: "Promise<void>",
    sideEffects: "Updates `user` and `isCompanyAdmin` refs.",
  },
  {
    name: "fetchEmployees",
    description: "Fetches all employees for the company and populates `employees`.",
    parameters: "none",
    returns: "Promise<void>",
    sideEffects: "Updates `employees` ref and triggers `fetchEmployeeStatus` for each employee.",
  },
  {
    name: "fetchEmployeeStatus",
    description: "Fetches multiple status flags for a single employee.",
    parameters: "employee: object",
    returns: "Promise<void>",
    sideEffects: "Updates `employee.status` with plan, network, claims, and card information.",
  },
  {
    name: "confirmRemove",
    description: "Confirms and removes an employee.",
    parameters: "employeeId: number",
    returns: "Promise<void>",
    sideEffects: "Deletes employee from backend, removes from `employees` list, triggers removal animation.",
  },
  {
    name: "onReorder",
    description: "Saves the reordered employee list to the backend.",
    parameters: "none",
    returns: "Promise<void>",
    sideEffects: "Updates the order of employees in backend via PATCH request.",
  }
];


</script>

<style scoped>
li.v-move,
.fall-move {
  transition: transform 0.25s cubic-bezier(.2,.8,.2,1);
}

.removing {
  animation: fallAway 0.65s forwards;
}

@keyframes fallAway {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  60% { transform: translateY(40px) rotate(5deg); opacity: 0.6; }
  100% { transform: translateY(80px) rotate(8deg); opacity: 0; }
}

/* small hover lift for items */
li:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.drag-handle:hover { opacity: 0.9; }
ul { padding: 0; list-style: none; margin: 0; }
</style>
