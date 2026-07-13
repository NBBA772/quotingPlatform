<template>
  <div class="mx-auto bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
   
    <InactiveLeadsSkeletonLoader v-if="loading" />


    <div v-else>
      <table class="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <thead class="bg-gray-100 dark:bg-[#142610]">
          <tr>
            <th class="p-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">First Name</th>
            <th class="p-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">Last Name</th>
            <th class="p-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">Email</th>
            <th class="p-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">Phone</th>
            <th class="p-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">Policy Type</th>
            <th class="p-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id" class="hover:bg-gray-50 dark:hover:bg-[#2d3a2a]">
            <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.firstName }}</td>
            <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.lastName }}</td>
            <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.email }}</td>
            <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.phone }}</td>
            <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.policyType }}</td>
            <td class="p-3 border-b dark:border-gray-700 dark:text-white">
              <button
                @click="restoreLead(lead.id)"
                class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Restore
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="leads.length === 0" class="text-gray-500 dark:text-gray-300 mt-4">
        No inactive leads found.
      </div>

      <p v-if="message" class="mt-4 text-green-600 dark:text-green-400">{{ message }}</p>
      <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'

const leads = ref<any[]>([])
const loading = ref(true)
const message = ref('')
const error = ref('')

// Fetch inactive leads (soft-deleted)
const fetchInactiveLeads = async () => {
  loading.value = true
  try {
    const authToken = Cookies.get('auth_token')
    const res = await $fetch('/api/leads/inactive', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    leads.value = res || []
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to fetch inactive leads'
  } finally {
    loading.value = false
  }
}

// Restore a lead
const restoreLead = async (leadId: number) => {
  message.value = ''
  error.value = ''

  try {
    const authToken = Cookies.get('auth_token')
    await $fetch(`/api/leads/${leadId}/restore`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    // Remove from local list
    leads.value = leads.value.filter(l => l.id !== leadId)
    message.value = 'Lead restored successfully'
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to restore lead'
  }
}

onMounted(() => {
  fetchInactiveLeads()
})
</script>
