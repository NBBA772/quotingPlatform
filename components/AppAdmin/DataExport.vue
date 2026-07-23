<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      :disabled="!!busy"
      class="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      @click="download('/api/admin/export/applications-csv', `applications-${today}.csv`)"
    >
      {{ busy === 'csv' ? 'Exporting…' : 'Export Applications (CSV)' }}
    </button>
    <button
      type="button"
      :disabled="!!busy"
      class="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#142610] disabled:opacity-50"
      @click="download('/api/admin/export/full', `database-${today}.json`)"
    >
      {{ busy === 'json' ? 'Exporting…' : 'Export Full Database (JSON)' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCookie } from '#imports'

const authToken = useCookie('auth_token').value
const busy = ref<'' | 'csv' | 'json'>('')
const today = new Date().toISOString().slice(0, 10)

async function download(url: string, filename: string) {
  busy.value = url.endsWith('csv') ? 'csv' : 'json'
  try {
    const blob: Blob = await $fetch(url, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      responseType: 'blob',
    })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (err: any) {
    console.error('Export failed:', err)
    alert(err?.data?.statusMessage || 'Export failed')
  } finally {
    busy.value = ''
  }
}
</script>
