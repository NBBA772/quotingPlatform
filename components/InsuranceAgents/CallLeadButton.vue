<template>
  <button
    @click="callLead"
    class="px-4 py-2 bg-green-600 dark:bg-[#142610] text-white font-semibold hover:bg-green-700 dark:hover:bg-[#3a4934]"
    :disabled="loading"
  >
    <span v-if="!loading">📞 Call Lead</span>
    <span v-else>Calling...</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "~/composables/useAuth"; // ✅ import your composable

const props = defineProps<{
  leadPhone: string;
}>();

const loading = ref(false);

const callLead = async () => {
  try {
    loading.value = true;

    const user = await useUser();
    if (!user?.id) {
      alert("You must be logged in to make a call.");
      return;
    }

    const res = await $fetch("/api/calls/call-lead", {
      method: "POST",
      body: {
        leadPhone: props.leadPhone,
        agentId: user.id, // ✅ automatically send logged-in user
      },
    });

    console.log("Call triggered:", res);
    alert(`Calling ${props.leadPhone}...`);
  } catch (err: any) {
    console.error("Error starting call:", err);
    alert("Failed to start call");
  } finally {
    loading.value = false;
  }
};
</script>
