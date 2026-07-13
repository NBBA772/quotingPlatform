<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 animate-pulse">
    <div v-for="n in 3" :key="n" class="card p-4 bg-white dark:bg-[#142610] shadow rounded-lg flex flex-col items-center space-y-3">
      <!-- Heading -->
      <div class="h-6 w-3/4 bg-gray-200 dark:bg-[#3a4934] rounded"></div>

      <!-- Image Placeholder -->
      <div class="w-full h-48 bg-gray-200 dark:bg-[#3a4934] rounded shadow"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed; fully static
</script>
