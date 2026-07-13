<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Request Web Development</h2>

    <Transition name="fade-slide" mode="out-in">
      <form v-if="showForm" key="web-form" @submit.prevent="submitRequest" class="space-y-4">

        <div>
          <label for="projectName" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Project Name</label>
          <input
            id="projectName"
            v-model="projectName"
            type="text"
            placeholder="Project Name"
            required
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="description" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Description / Requirements</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Optional: Describe the project details"
            rows="4"
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="resetForm"
            class="px-4 py-2 rounded-lg bg-gray-500 dark:bg-[#142610] dark:hover:bg-[#1d3620] text-white hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]"
          >
            {{ loading ? 'Submitting...' : 'Request Development' }}
          </button>
        </div>

        <p v-if="success" class="text-green-500 font-medium mt-2">{{ success }}</p>
        <p v-if="error" class="text-red-500 font-medium mt-2">{{ error }}</p>
      </form>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'

const projectName = ref('')
const description = ref('')
const loading = ref(false)
const success = ref('')
const error = ref('')
const showForm = ref(true)
const authCookie = useAuthCookie()

function resetForm() {
  projectName.value = ''
  description.value = ''
  success.value = ''
  error.value = ''

  // Animate the form reset like SEO form
  showForm.value = false
  nextTick(() => (showForm.value = true))
}

async function submitRequest() {
  if (!projectName.value) return

  loading.value = true
  success.value = ''
  error.value = ''

  try {
    await $fetch('/api/company/web-development-request', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        projectName: projectName.value,
        description: description.value
      }
    })
    success.value = 'Web development request submitted successfully!'
    resetForm()
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to submit request.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Fade + slide animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
