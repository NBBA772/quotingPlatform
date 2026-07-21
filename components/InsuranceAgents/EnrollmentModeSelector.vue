<template>
  <div>
    <div v-if="availableModes.length === 0" class="text-gray-500 dark:text-gray-300 p-4">
      You don't have permission to work with any enrollment types yet. Ask an admin to enable one.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        v-for="mode in availableModes"
        :key="mode.key"
        type="button"
        class="text-left border-2 rounded-xl p-5 transition"
        :class="modelValue === mode.key
          ? 'border-blue-600 dark:border-green-500 bg-blue-50 dark:bg-[#142610]'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
        @click="$emit('update:modelValue', mode.key)"
      >
        <div class="text-lg font-semibold text-gray-800 dark:text-white">{{ mode.label }}</div>
        <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">{{ mode.description }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string | null
  canIndividual?: boolean
  canGroup?: boolean
  canCustom?: boolean
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const allModes = [
  { key: 'individual', label: 'Individual & Family', description: 'Enroll a single person or household.', flag: 'canIndividual' },
  { key: 'group', label: 'Group', description: 'Onboard a company; their admin adds employees.', flag: 'canGroup' },
  { key: 'custom', label: 'Custom', description: 'Company with admin-authored plans employees select.', flag: 'canCustom' },
] as const

const availableModes = computed(() =>
  allModes.filter((m) => (props as any)[m.flag])
)

// Auto-select the first permitted mode so the panel is never empty.
watch(
  availableModes,
  (modes) => {
    if (modes.length && !modes.some((m) => m.key === props.modelValue)) {
      emit('update:modelValue', modes[0].key)
    }
  },
  { immediate: true }
)
</script>
