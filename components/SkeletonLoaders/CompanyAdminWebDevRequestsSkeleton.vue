<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Web Development Requests</h2>

    <!-- Skeleton table -->
    <table class="w-full table-auto border-collapse animate-pulse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610] text-left">
          <th class="p-2 border-b">Project Name</th>
          <th class="p-2 border-b">Description</th>
          <th class="p-2 border-b">Status</th>
          <th class="p-2 border-b">Requested At</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in rows" :key="n">
          <td class="p-2 border-b">
            <div class="h-4 w-28 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
          <td class="p-2 border-b">
            <div class="h-4 w-40 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
          <td class="p-2 border-b">
            <div class="h-4 w-20 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
          <td class="p-2 border-b">
            <div class="h-4 w-32 bg-gray-300 dark:bg-[#63725C] rounded"></div>
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
