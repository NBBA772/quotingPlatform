<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <div class="flex items-center">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex-1">Enrollment Request</h2>

      <!-- Toggle Open / Processed on the right -->
      <div class="flex space-x-2 ml-auto">
        <button
          class="px-4 py-2 rounded-lg border transition"
          :class="viewMode === 'current'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white dark:bg-[#142610] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'"
          @click="switchMode('current')"
        >
          Pending
        </button>
        <button
          class="px-4 py-2 rounded-lg border transition"
          :class="viewMode === 'processed'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white dark:bg-[#142610] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'"
          @click="switchMode('processed')"
        >
          Processed
        </button>
      </div>
    </div>

    <!-- Conditionally show components -->
    <ActiveAuditTrail v-if="viewMode === 'current'" />
    <InactiveAuditTrail v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const viewMode = ref<"current" | "processed">("current");

const switchMode = (mode: "current" | "processed") => {
  viewMode.value = mode;
};
</script>
