<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Request SEO for a Page</h2>

    <Transition name="fade-slide" mode="out-in">
      <form v-if="showForm" key="seo-form" @submit.prevent="submitRequest" class="space-y-4">

        <div>
          <label for="pageUrl" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Page URL</label>
          <input
            id="pageUrl"
            v-model="pageUrl"
            type="url"
            placeholder="https://example.com/page"
            required
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="description" class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Page Description / Keywords</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Optional: Describe the content or keywords for SEO"
            rows="3"
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#63725C] text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="resetForm"
            class="px-4 py-2 rounded-lg bg-gray-500 dark:bg-[#142610] dark:hover:bg-[#1d3620] text-white hover:bg-gray-600 "
          >
            Reset
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]"
          >
            {{ loading ? 'Submitting...' : 'Request SEO' }}
          </button>
        </div>

        <p v-if="success" class="text-green-500 font-medium mt-2">{{ success }}</p>
        <p v-if="error" class="text-red-500 font-medium mt-2">{{ error }}</p>
      </form>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthCookie } from '~/composables/useAuth'

const pageUrl = ref('')
const description = ref('')
const loading = ref(false)
const success = ref('')
const error = ref('')
const authCookie = useAuthCookie()

const showForm = ref(true)

function resetForm() {
  pageUrl.value = ''
  description.value = ''
  success.value = ''
  error.value = ''
  
  // Trigger a re-render to animate reset
  showForm.value = false
  nextTick(() => {
    showForm.value = true
  })
}

async function submitRequest() {
  if (!pageUrl.value) return

  loading.value = true
  success.value = ''
  error.value = ''

  try {
    await $fetch('/api/company/seo-request', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        pageUrl: pageUrl.value,
        description: description.value
      }
    })
    success.value = 'SEO request submitted successfully!'
    resetForm()
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to submit SEO request.'
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
