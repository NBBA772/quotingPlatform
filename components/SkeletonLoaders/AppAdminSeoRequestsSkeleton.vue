<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934] overflow-x-auto">
    <!-- Skeleton table -->
    <table class="w-full table-auto border-collapse animate-pulse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610] text-left">
          <th class="p-2 border-b">Page URL</th>
          <th class="p-2 border-b">Description</th>
          <th class="p-2 border-b">Status</th>
          <th class="p-2 border-b">Requested At</th>
          <th class="p-2 border-b">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in rows" :key="n">
          <!-- Page URL -->
          <td class="p-2 border-b">
            <div class="h-4 w-2/3 max-w-[160px] bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>

          <!-- Description -->
          <td class="p-2 border-b">
            <div class="h-4 w-3/4 max-w-[200px] bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>

          <!-- Status -->
          <td class="p-2 border-b">
            <div class="h-4 w-1/2 max-w-[100px] bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>

          <!-- Requested At -->
          <td class="p-2 border-b">
            <div class="h-4 w-2/3 max-w-[140px] bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>

          <!-- Actions -->
          <td class="p-2 border-b">
            <div class="h-6 w-2/3 max-w-[120px] bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const rows = 5 // number of skeleton rows
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.animate-pulse {
  animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
