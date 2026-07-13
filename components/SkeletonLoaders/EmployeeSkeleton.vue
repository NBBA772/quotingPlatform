<!-- EmployeeSkeleton.vue -->
<template>
  <ul class="space-y-4">
    <li
      v-for="n in count"
      :key="n"
      class="p-3 bg-white dark:bg-[#142610] shadow rounded-lg flex justify-between items-center animate-pulse"
    >
      <!-- Left: drag handle + name/email -->
      <div class="flex items-center space-x-2 w-full">
        <div class="w-6 h-6 bg-gray-300 dark:bg-[#63725C] rounded"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-4 bg-gray-300 dark:bg-[#63725C] rounded w-1/3"></div>
          <div class="h-3 bg-gray-300 dark:bg-[#63725C] rounded w-1/2"></div>
        </div>
      </div>

      <!-- Right: icons placeholder -->
      <div class="flex items-center space-x-3">
        <div
          v-for="i in 6"
          :key="i"
          class="w-5 h-5 bg-gray-300 dark:bg-[#63725C] rounded"
        ></div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
const count = 5; // Number of skeleton items to show
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
