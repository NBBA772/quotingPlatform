<template>
  <div class="animate-pulse space-y-2">
    <!-- Heading -->
    <div class="h-6 w-40 bg-gray-200 dark:bg-[#3a4934] rounded mb-2"></div>

    <!-- Rows -->
    <div class="flex flex-col gap-2" v-for="row in defaultRows" :key="row">
      <div
        v-for="col in defaultColumns"
        :key="col"
        class="h-4 bg-gray-200 dark:bg-[#3a4934] rounded w-full"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const defaultRows = 1;
const defaultColumns = 2;
</script>
