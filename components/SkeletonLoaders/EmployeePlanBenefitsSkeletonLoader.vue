<template>
  <ul class="space-y-3 animate-pulse">
    <li v-for="n in 3" :key="n" class="p-3 border rounded-lg bg-gray-200 dark:bg-[#3a4934]">
      <div class="h-4 w-3/4 bg-gray-300 dark:bg-[#3a4934] rounded mb-2"></div>
      <div class="h-3 w-full bg-gray-300 dark:bg-[#3a4934] rounded"></div>
    </li>
  </ul>
</template>

<script setup lang="ts">
// Static skeleton, no props required
</script>
