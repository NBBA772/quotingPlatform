<template>
  <ul class="space-y-2">
    <li
      v-for="n in rows"
      :key="n"
      class="p-3 border rounded-lg flex justify-between items-center animate-pulse"
      :class="['bg-gray-100 dark:bg-[#3a4934]']"
    >
      <div class="space-y-1">
        <div class="h-4 rounded w-32 bg-gray-300 dark:bg-[#63725C]"></div>
        <div class="h-3 rounded w-48 bg-gray-300 dark:bg-[#63725C]"></div>
      </div>
      <div class="h-8 w-20 rounded bg-gray-300 dark:bg-[#63725C]"></div>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{ rows?: number }>()
const rows = props.rows || 5
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
