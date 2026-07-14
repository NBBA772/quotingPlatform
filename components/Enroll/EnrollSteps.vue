<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-2">
      <span
        v-for="(label, i) in labels"
        :key="label"
        class="text-xs md:text-sm font-medium"
        :class="i <= current ? 'text-blue-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'"
      >
        {{ i + 1 }}. {{ label }}
      </span>
    </div>
    <div class="flex items-center space-x-2">
      <div
        v-for="(label, i) in labels"
        :key="'bar-' + label"
        class="flex-1 h-2 rounded-full"
        :class="i <= current ? 'bg-blue-600 dark:bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ current: number }>()
const labels = ['Applicant', 'Underwriting', 'Plan', 'Dental / Vision / Ancillary', 'Payment & Sign']
</script>
