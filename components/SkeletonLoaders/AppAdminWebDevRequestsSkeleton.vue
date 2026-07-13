<template>
  <div class="animate-pulse p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">

    <!-- Table skeleton -->
    <table class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610]">
          <th v-for="i in 5" :key="i" class="p-2 border-b">
            <div class="h-4 w-20 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in rows" :key="n">
          <!-- Project Name -->
          <td class="p-2 border-b">
            <div class="h-4 w-3/4 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
          <!-- Description -->
          <td class="p-2 border-b">
            <div class="h-4 w-5/6 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
          <!-- Status -->
          <td class="p-2 border-b">
            <div class="h-4 w-16 bg-gray-300 dark:bg-[#63725C] rounded-full"></div>
          </td>
          <!-- Requested At -->
          <td class="p-2 border-b">
            <div class="h-4 w-24 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </td>
          <!-- Actions -->
          <td class="p-2 border-b">
            <div class="h-6 w-24 bg-gray-300 dark:bg-[#63725C] rounded-lg"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rows: {
    type: Number,
    default: 5, // number of fake rows
  },
})
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
