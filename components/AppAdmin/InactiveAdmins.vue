<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      Inactive Admins
    </h2>

    <!-- Skeleton Loader -->
    <AppAdminInactiveEmployeesSkeleton v-if="loading" :rows="6" />

    <!-- Agents list -->
    <div v-else>
      <div v-if="agents.length === 0" class="text-gray-500 dark:text-gray-400">
        No inactive admins found.
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="agent in agents"
          :key="agent.id"
          :class="[
            'p-3 bg-white dark:bg-[#142610] dark:hover:bg-[#1b3320] shadow rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center transition-transform',
            { removing: removingIds.has(agent.id) }
          ]"
        >
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-200">
              {{ agent.firstName }} {{ agent.lastName }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ agent.email }}</p>
            <p class="text-xs text-gray-400">Username: {{ agent.username }}</p>
          </div>

          <!-- Restore button -->
          <button
            @click="restoreAgent(agent.id)"
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

const agents = ref([]);
const loading = ref(true);
const removingIds = ref(new Set()); // track which are being restored

// Fetch inactive agents
const fetchInactiveAdmins = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get("/api/admin/inActiveAdmin", {
     
    });
    agents.value = data;
  } catch (err) {
    console.error("Error fetching inactive agents", err);
    agents.value = [];
  } finally {
    loading.value = false;
  }
};

// Restore an agent (with animation)
const restoreAgent = async (id) => {
  if (!confirm("Are you sure you want to restore this agent?")) return;

  removingIds.value.add(id);

  const ANIM_MS = 650;
  await new Promise((res) => setTimeout(res, ANIM_MS));

  try {
    await axios.patch(`/api/admin/${id}/restore`);
    agents.value = agents.value.filter((a) => a.id !== id);
  } catch (err) {
    console.error("Error restoring agent", err);
    removingIds.value.delete(id); // rollback if error
  }
};

onMounted(fetchInactiveAdmins);
</script>

<style scoped>
.removing {
  animation: fadeOut 0.65s forwards;
}
@keyframes fadeOut {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
