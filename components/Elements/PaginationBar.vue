<template>
  <div v-if="total > pageSize" class="flex items-center justify-between mt-3 text-sm">
    <span class="text-gray-500 dark:text-gray-400">
      Showing {{ from }}–{{ to }} of {{ total }}
    </span>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-[#142610] text-gray-700 dark:text-gray-200"
        :disabled="page <= 1"
        @click="$emit('update:page', page - 1)"
      >
        Prev
      </button>
      <span class="text-gray-600 dark:text-gray-300">Page {{ page }} of {{ totalPages }}</span>
      <button
        type="button"
        class="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-[#142610] text-gray-700 dark:text-gray-200"
        :disabled="page >= totalPages"
        @click="$emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ total: number; page: number; pageSize: number }>()
defineEmits<{ (e: 'update:page', v: number): void }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>
