<template>
  <div class="flex items-center space-x-2">
    <span :class="statusClass">{{ statusText }}</span>

    <button
      @click="toggleAvailability"
      class="px-2 py-1 rounded text-white"
      :class="buttonClass"
      :disabled="loading"
    >
      {{ loading ? 'Updating...' : 'Toggle' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Cookies from 'js-cookie'

const isAvailable = ref<null | boolean>(null)
const loading = ref(false)

const statusClass = computed(() => {
  if (isAvailable.value === null) return 'text-gray-500 font-bold'
  return isAvailable.value ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
})

const statusText = computed(() => {
  if (isAvailable.value === null) return 'Loading...'
  return isAvailable.value ? 'Available' : 'Unavailable'
})

const buttonClass = computed(() =>
  isAvailable.value ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
)

const fetchCurrentAgent = async () => {
  try {
    const authToken = Cookies.get('auth_token')
    if (!authToken) throw new Error('No auth token')

    const res = await $fetch('/api/insurance-agent/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (res.success) {
      isAvailable.value = res.agent.isAvailable
    }
  } catch (err: any) {
    console.error(err)
  }
}

const toggleAvailability = async () => {
  loading.value = true
  try {
    const authToken = Cookies.get('auth_token')
    if (!authToken) throw new Error('No auth token')

    const res = await $fetch('/api/insurance-agent/me/toggle-availability', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { isAvailable: !isAvailable.value },
    })

    if (res.success) {
      isAvailable.value = !isAvailable.value
    } else {
      throw new Error('Failed to update availability')
    }
  } catch (err: any) {
    console.error(err)
    alert(err.message || 'Error updating availability')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCurrentAgent()
})
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
