<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <h2 class="text-xl font-bold dark:text-white mb-3">Agent Managers (Uplines)</h2>

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading…</div>
    <div v-else-if="managers.length === 0" class="text-gray-500 dark:text-gray-300 text-sm">
      No agent managers yet.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="m in managers"
        :key="m.id"
        class="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#142610] rounded border border-gray-200 dark:border-gray-700"
      >
        <div>
          <p class="font-semibold dark:text-white">{{ m.firstName }} {{ m.lastName }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ m.email }}</p>
        </div>
        <button
          class="text-red-600 hover:text-red-800"
          title="Delete permanently"
          @click="permanentDelete(m)"
        >
          <Icon name="mdi:delete-forever" size="22" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCookie } from '#imports'

const authToken = useCookie('auth_token').value
const managers = ref<any[]>([])
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    const res: any = await $fetch('/api/agent-admin/list', {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    })
    managers.value = res.managers || []
  } catch (err) {
    console.error('Error loading agent managers:', err)
  } finally {
    loading.value = false
  }
}

const permanentDelete = async (m: any) => {
  if (!authToken) return
  if (!confirm(`PERMANENTLY delete manager ${m.firstName} ${m.lastName}? Their downline agents stay but lose this upline. This cannot be undone.`)) return
  try {
    await $fetch(`/api/agent-admin/${m.id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    managers.value = managers.value.filter((x) => x.id !== m.id)
  } catch (err: any) {
    console.error('Error deleting manager:', err)
    alert(err?.data?.statusMessage || 'Failed to delete manager')
  }
}

onMounted(load)
</script>
