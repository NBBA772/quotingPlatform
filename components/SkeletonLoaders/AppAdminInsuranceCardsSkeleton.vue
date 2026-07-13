<template>
  <div class="space-y-6 animate-pulse">
    <!-- Member skeleton -->
    <div
      v-for="n in members"
      :key="n"
      class="p-4 shadow rounded-lg bg-white dark:bg-[#142610]"
    >
      <!-- Header row -->
      <div class="flex justify-between items-center mb-3">
        <div class="h-6 w-32 bg-gray-300 dark:bg-[#3a4934] rounded"></div>
        <div class="h-5 w-16 bg-gray-300 dark:bg-[#3a4934] rounded"></div>
      </div>

      <!-- Relation select -->
      <div class="h-9 w-40 bg-gray-300 dark:bg-[#3a4934] rounded mb-4"></div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="c in 3"
          :key="c"
          class="p-4 shadow rounded-lg bg-gray-50 dark:bg-[#1f2e1f] flex flex-col items-center"
        >
          <div class="h-5 w-24 bg-gray-300 dark:bg-[#3a4934] rounded mb-2"></div>
          <div class="w-full h-48 border-2 border-dashed rounded-lg bg-gray-200 dark:bg-[#3a4934]"></div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 mt-4">
      <div class="h-10 w-36 bg-gray-300 dark:bg-[#3a4934] rounded"></div>
      <div class="h-10 w-36 bg-gray-300 dark:bg-[#3a4934] rounded"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const members = 2 // Number of fake members to display while loading
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
