<template>
  <div class="animate-pulse">

    <!-- Table skeleton -->
    <table class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-[#142610]">
          <th v-for="i in 4" :key="i" class="p-2 border-b">
            <div class="h-4 w-24 bg-gray-300 dark:bg-[#63725C] rounded"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in rows" :key="n">
          <td v-for="i in 4" :key="i" class="p-2 border-b">
            <div class="h-4 w-3/4 bg-gray-300 dark:bg-[#63725C] rounded"></div>
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
    default: 5, // number of fake rows to render
  },
})
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
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
