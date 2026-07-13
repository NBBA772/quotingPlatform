<template>
  <div class="mx-auto py-4">
    <!-- Show skeleton loader while loading -->
    <EmployeeSkeleton v-if="loading" />

    <!-- No deleted employees message -->
    <div v-else-if="deletedEmployees.length === 0" class="text-white">
      No deleted employees found.
    </div>

    <!-- List of deleted employees -->
    <ul v-else class="space-y-2 px-0">
      <li
        v-for="emp in deletedEmployees"
        :key="emp.employeeId"
        :class="[
          'p-3 bg-white dark:bg-[#142610] dark:hover:bg-[#1b3320] shadow rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center transition-transform',
          { removing: removingIds.has(emp.employeeId) }
        ]"
      >
        <div>
          <p class="font-semibold">{{ emp.name }}</p>
          <p class="text-sm text-gray-500">
            Deleted At: {{ formatDate(emp.deletedAt) }}
          </p>
        </div>
        <button
          class="bg-green-500 hover:bg-green-600 dark:bg-[#046937] dark:hover:bg-[#058a45] text-white px-3 py-1 rounded "
          @click="onRestoreClick(emp.employeeId)"
        >
          Restore
        </button>
      </li>
    </ul>

    <!-- docs omitted for brevity (propsMeta / functionsMeta) -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useCookie } from "#imports";
import EmployeeSkeleton from "../SkeletonLoaders/EmployeeSkeleton.vue";

interface DeletedEmployee {
  employeeId: number;
  name: string;
  deletedAt: string;
}

// Props
const props = withDefaults(
  defineProps<{ mock?: boolean; userId?: number }>(),
  { mock: false }
);

const deletedEmployees = ref<DeletedEmployee[]>([]);
const loading = ref(false);

// Use reactive Set so `.add()` / `.delete()` are reactive
const removingIds = reactive(new Set<number>());

const authToken = useCookie("auth_token").value;

// Demo data for mock mode
const demoDeletedEmployees: DeletedEmployee[] = [
  { employeeId: 1, name: "Bob Smith", deletedAt: new Date().toISOString() },
  { employeeId: 2, name: "Jane Doe", deletedAt: new Date().toISOString() },
];

const fetchDeletedEmployees = async () => {
  if (!authToken && !props.mock) {
    console.warn("No auth token. Skipping API call.");
    deletedEmployees.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;

  if (props.mock) {
    await new Promise((r) => setTimeout(r, 200));
    deletedEmployees.value = [...demoDeletedEmployees];
    loading.value = false;
    return;
  }

  try {
    const res: DeletedEmployee[] = await $fetch("/api/company/deleted-employees", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    deletedEmployees.value = res;
  } catch (err) {
    console.error("Error fetching deleted employees:", err);
    deletedEmployees.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

// Handler that adds removing class, waits for animation, then restores
const onRestoreClick = async (employeeId: number) => {
  if (!confirm("Are you sure you want to restore this employee?")) return;

  // mark as animating
  removingIds.add(employeeId);

  // animation duration must match CSS (650ms)
  const ANIM_MS = 650;
  await new Promise((res) => setTimeout(res, ANIM_MS));

  if (props.mock) {
    // in mock mode just remove
    deletedEmployees.value = deletedEmployees.value.filter(e => e.employeeId !== employeeId);
    removingIds.delete(employeeId);
    return;
  }

  if (!authToken) {
    console.warn("No auth token — cannot restore");
    removingIds.delete(employeeId);
    return;
  }

  try {
    await $fetch(`/api/employee/${employeeId}/restore`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Remove from list (leave animation already played)
    deletedEmployees.value = deletedEmployees.value.filter(e => e.employeeId !== employeeId);
    removingIds.delete(employeeId);
  } catch (err) {
    console.error("Failed to restore employee:", err);
    // rollback the removing state so the item returns to normal
    removingIds.delete(employeeId);
    alert("Failed to restore employee. See console for details.");
  }
};

onMounted(fetchDeletedEmployees);
</script>

<style scoped>
/* Keep the same fallAway animation used elsewhere */
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
</style>
