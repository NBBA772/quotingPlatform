<template>
  <div class="mx-auto py-6">
    <div v-if="!mock" class="mb-4">
      <h2 class="text-xl font-bold">Inactive Insurance Agents</h2>
    </div>
    <!-- Skeleton loader while loading -->
    <EmployeeSkeleton v-if="loading" />

    <!-- No deleted agents message -->
    <div v-else-if="deletedAgents.length === 0" class="text-white">
      No deleted insurance agents found.
    </div>

    <!-- List of deleted agents -->
    <ul v-else class="space-y-2 px-0">
      <li
        v-for="agent in deletedAgents"
        :key="agent.id"
        :class="['p-3 bg-white dark:bg-[#142610] dark:hover:bg-[#1b3320] shadow rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center transition-transform', { removing: removingIds.has(agent.id) }]"
      >
        <div>
          <p class="font-semibold">{{ agent.name }}</p>
          <p class="text-sm text-gray-500">
            Deleted At: {{ formatDate(agent.deletedAt) }}
          </p>
          <p class="text-xs text-gray-400">Username: {{ agent.username }}</p>
        </div>
        <button
          class="bg-green-500 hover:bg-green-600 dark:bg-[#046937] dark:hover:bg-[#058a45] text-white px-3 py-1 rounded"
          @click="onRestoreClick(agent.id)"
        >
          Restore
        </button>
      </li>



    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useCookie } from "#imports";
import EmployeeSkeleton from "../SkeletonLoaders/EmployeeSkeleton.vue";

interface DeletedAgent {
  id: number;
  name: string;
  username: string;
  deletedAt: string;
}

const props = withDefaults(
  defineProps<{ mock?: boolean; userId?: number }>(),
  { mock: false }
);

const deletedAgents = ref<DeletedAgent[]>([]);
const loading = ref(false);
const removingIds = reactive(new Set<number>());
const authToken = useCookie("auth_token").value;

// Mock data for demo
const demoDeletedAgents: DeletedAgent[] = [
  { id: 1, name: "Alice Johnson", username: "alicej", deletedAt: new Date().toISOString() },
  { id: 2, name: "Mark Spencer", username: "marksp", deletedAt: new Date().toISOString() },
];

const fetchDeletedAgents = async () => {
  if (!authToken && !props.mock) {
    deletedAgents.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;

  if (props.mock) {
    await new Promise(r => setTimeout(r, 200));
    deletedAgents.value = [...demoDeletedAgents];
    loading.value = false;
    return;
  }

  try {
    const res: DeletedAgent[] = await $fetch("/api/insurance-agent/inActiveAgent", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    deletedAgents.value = res;
  } catch (err) {
    console.error("Error fetching deleted agents:", err);
    deletedAgents.value = [];
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

// Restore agent
const onRestoreClick = async (id: number) => {
  if (!confirm("Are you sure you want to restore this agent?")) return;

  removingIds.add(id);

  const ANIM_MS = 650;
  await new Promise(r => setTimeout(r, ANIM_MS));

  if (props.mock) {
    deletedAgents.value = deletedAgents.value.filter(a => a.id !== id);
    removingIds.delete(id);
    return;
  }

  if (!authToken) {
    removingIds.delete(id);
    return;
  }

  try {
    await $fetch(`/api/insurance-agent/${id}/restore`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    deletedAgents.value = deletedAgents.value.filter(a => a.id !== id);
    removingIds.delete(id);
  } catch (err) {
    console.error("Failed to restore agent:", err);
    removingIds.delete(id);
    alert("Failed to restore agent. See console for details.");
  }
};

onMounted(fetchDeletedAgents);
</script>

<style scoped>
.removing {
  animation: fallAway 0.65s forwards;
}

@keyframes fallAway {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  60% { transform: translateY(40px) rotate(5deg); opacity: 0.6; }
  100% { transform: translateY(80px) rotate(8deg); opacity: 0; }
}

li:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>
