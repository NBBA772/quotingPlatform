<template>
  <div class="bg-white dark:bg-[#142610] border-b border-gray-300">
    <div class="max-w-6xl mx-auto bg-white dark:bg-[#142610] p-6 relative z-10">
      <!-- Profile Header -->
      <div class="flex items-center space-x-6">
        <!-- Avatar -->
        <div class="relative">
          <img
            :src="user?.avatar || placeholder"
            alt="Profile Avatar"
            class="w-48 h-48 rounded-full border-4 border-white dark:border-gray-800  mx-auto"
          />

          <!-- Camera Icon -->
          <label
            for="avatar-upload"
            class="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 shadow-md"
            title="Upload Avatar"
          >
            <slot name="avatar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </slot>
          </label>

          <input
            id="avatar-upload"
            type="file"
            name="avatar"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <!-- Name and Role -->
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ user?.firstName }} {{ user?.lastName }}
          </h1>
          <p v-if="user" class="text-white dark:text-gray-400">{{ role }}</p>
          <p v-else class="text-gray-400">Loading...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  user: {
    type: Object as () => { firstName?: string; lastName?: string; avatar?: string } | null,
    default: null
  },
  role: {
    type: String,
    default: 'Company Admin'
  },
  placeholder: {
    type: String,
    default: 'https://placehold.co/500x500'
  }
})

const emit = defineEmits<{
  (e: 'file-change', file: File): void
}>()

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (file) emit('file-change', file)
}
</script>

<style scoped>
/* Optional: keep your styling here */
</style>
