<template>
  <div class="coverage-summary border border-gray-200 dark:border-gray-700 shadow p-4 bg-white dark:bg-[#142610] rounded-lg animate-pulse space-y-4">
    <!-- Heading -->
    <div class="h-6 w-1/2 sm:w-1/3 md:w-1/4 bg-gray-200 dark:bg-[#3a4934] rounded"></div>

    <!-- Table Skeleton -->
    <div class="space-y-2">
      <div v-for="row in defaultRows" :key="row" class="flex justify-between gap-4">
        <div class="h-4 bg-gray-200 dark:bg-[#3a4934] rounded w-1/2 sm:w-2/5 md:w-1/3"></div>
        <div class="h-4 bg-gray-200 dark:bg-[#3a4934] rounded w-1/6 sm:w-1/8 md:w-1/12"></div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
// Responsive skeleton, no props needed
const defaultRows = 3
</script>
