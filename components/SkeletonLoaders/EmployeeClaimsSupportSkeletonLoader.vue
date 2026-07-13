<template>
  <div class="animate-pulse space-y-4 p-4 border border-gray-200 dark:border-gray-700 shadow rounded-lg bg-white dark:bg-[#142610]">
    <div class="h-6 w-1/3 bg-gray-200 dark:bg-[#3a4934] rounded"></div>
    <ul class="space-y-3">
      <li v-for="n in 3" :key="n" class="space-y-1 border-b pb-3">
        <div class="h-4 w-1/4 bg-gray-200 dark:bg-[#3a4934] rounded"></div>
        <div class="h-4 w-1/2 bg-gray-200 dark:bg-[#3a4934] rounded"></div>
        <div class="h-4 w-3/4 bg-gray-200 dark:bg-[#3a4934] rounded"></div>
        <div class="h-4 w-1/3 bg-gray-200 dark:bg-[#3a4934] rounded"></div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// No props needed; fully static skeleton
</script>
