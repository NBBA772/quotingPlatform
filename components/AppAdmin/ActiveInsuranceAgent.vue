<template>
  <div class="mx-auto py-6">
    <div v-if="!mock" class="mb-4">
      <h2 class="text-xl font-bold">Active Insurance Agents</h2>
    </div>
    <!-- Restrict access -->
    <div v-if="!isAppAdmin" class="text-red-500">
      You do not have permission to manage insurance agents.
    </div>

    <!-- Loading skeleton -->
    <EmployeeSkeleton v-else-if="loading" />

    <!-- Empty state -->
    <div v-else-if="agents.length === 0" class="text-gray-600 dark:text-gray-200">
      No agents registered yet.
    </div>

    <!-- Draggable List -->
    <draggable
      v-else
      v-model="agents"
      handle=".drag-handle"
      item-key="id"
      tag="ul"
      @end="onReorder"
    >
      <template #item="{ element: agent }">
        <li
          :key="agent.id"
          :class="[
            'p-3 mb-4 bg-white dark:bg-[#142610] dark:hover:bg-[#1b3320] shadow rounded-lg border border-gray-200 dark:border-gray-700 flex items-center transition-transform',
            { removing: removingIds.has(agent.id) }
          ]"
        >
          <!-- Left: drag handle + name/email -->
          <div class="flex items-center space-x-2 w-1/3 min-w-[120px]">
            <span class="drag-handle cursor-grab text-gray-400 select-none">☰</span>
            <div>
              <p class="font-semibold">{{ agent.firstName }} {{ agent.lastName }}</p>
              <p class="text-sm text-gray-500">{{ agent.email }}</p>
              <p class="text-xs text-gray-400">Username: {{ agent.username }}</p>
            </div>
          </div>

          <!-- Center: Phone -->
          <div class="flex items-center justify-center w-1/3">
            <Icon name="mdi:phone-outline" size="18" class="text-gray-500 mr-1" />
            <span class="text-sm">{{ agent.phone || "N/A" }}</span>
          </div>

          <!-- Right: Delete -->
          <div class="flex justify-end w-1/3 min-w-[60px]">
            <button
              class="text-red-500 hover:text-red-700"
              @click="confirmRemove(agent.id)"
              title="Remove Agent"
            >
              <Icon name="mdi:trash-can-outline" size="20" />
            </button>
          </div>
        </li>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCookie } from "#imports";
import draggable from "vuedraggable";

const agents = ref<any[]>([]);
const loading = ref(false);
const isAppAdmin = ref(false);
const removingIds = ref(new Set<number>());
const authToken = useCookie("auth_token").value;

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
});

// --- Fetch user ---
const fetchUser = async () => {
  if (!authToken) return;
  try {
    const res = await $fetch("/api/user", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    isAppAdmin.value = !!res?.appAdminId;
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

// --- Fetch agents ---
const fetchAgents = async () => {
  if (!authToken) return;
  loading.value = true;
  try {
    const res = await $fetch("/api/insurance-agent", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    agents.value = (res || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    console.error("Error fetching agents:", err);
  } finally {
    loading.value = false;
  }
};



// --- Confirm remove ---
const confirmRemove = async (agentId: number) => {
  if (!authToken) return;
  if (!confirm("Are you sure you want to remove this agent?")) return;

  removingIds.value.add(agentId);
  const ANIM_MS = 650;
  await new Promise((res) => setTimeout(res, ANIM_MS));

  try {
    await $fetch(`/api/insurance-agent/${agentId}/delete`, {
      method: "PATCH", // ✅ soft delete
      headers: { Authorization: `Bearer ${authToken}` },
    });
    agents.value = agents.value.filter((a) => a.id !== agentId);
  } catch (err) {
    console.error("Error removing agent:", err);
    removingIds.value.delete(agentId);
    alert("Failed to remove agent");
  }
};


// --- Reorder handler ---
const onReorder = async () => {
  if (!authToken) return;
  try {
    const payload = {
      order: agents.value.map((agent, index) => ({ id: agent.id, order: index })),
    };
    await $fetch("/api/insurance-agent/reorder", {
      method: "PATCH",
      body: payload, // now matches backend
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (err) {
    console.error("Error saving agent order:", err);
  }
};


onMounted(async () => {
  await fetchUser();
  if (isAppAdmin.value) await fetchAgents();
});
</script>

<style scoped>
.input {
  @apply border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934];
}
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
li:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
.drag-handle:hover { opacity: 0.9; }
ul { padding: 0; list-style: none; margin: 0; }
</style>
