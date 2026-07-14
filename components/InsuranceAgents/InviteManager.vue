<template>
  <div class="p-6 bg-white rounded-2xl shadow border border-gray-200">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Lead Invites</h2>

    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr class="text-left text-gray-500 uppercase text-sm">
          <th class="py-2 px-3">Email</th>
          <th class="py-2 px-3">Lead</th>
          <th class="py-2 px-3">Agent</th>
          <th class="py-2 px-3">Created</th>
          <th class="py-2 px-3">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="invite in invites" :key="invite.id">
          <td class="py-2 px-3">{{ invite.email }}</td>
          <td class="py-2 px-3">{{ invite.lead?.name || '—' }}</td>
          <td class="py-2 px-3">
            <span v-if="invite.agent">{{ invite.agent.firstName }} {{ invite.agent.lastName }}</span>
            <span v-else class="text-gray-400 italic">Unassigned</span>
          </td>
          <td class="py-2 px-3 text-gray-500 text-sm">
            {{ new Date(invite.createdAt).toLocaleString() }}
          </td>
          <td class="py-2 px-3">
            <select
              v-model="selectedAgent[invite.id]"
              class="border rounded-lg p-1 text-sm"
            >
              <option disabled value="">Select Agent</option>
              <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                    {{ agent.firstName }} {{ agent.lastName }}
              </option>
            </select>
            <button
              @click="assignAgent(invite.id)"
              class="ml-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
            >
              Save
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const invites = ref<any[]>([])
const agents = ref<any[]>([])
const selectedAgent = ref<Record<string, string>>({})

async function loadData() {
  const res = await $fetch('/api/leads/invites')
  invites.value = res.invites || []

  const agentRes = await $fetch('/api/insurance-agent/list')
  agents.value = agentRes.agents || []
}

async function assignAgent(inviteId: string) {
  const agentId = selectedAgent.value[inviteId]
  if (!agentId) return alert('Please select an agent first')

  await $fetch('/api/leads/assign-agent', {
    method: 'POST',
    body: { inviteId, agentId },
  })

  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
table {
  width: 100%;
}
</style>
