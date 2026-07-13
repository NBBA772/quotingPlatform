<template>
  <div class="p-6 bg-white rounded-2xl shadow border border-gray-200">
    <h2 class="text-2xl font-bold mb-4 text-gray-800">Company Agent Assignments</h2>

    <div class="overflow-x-auto">
      <table class="min-w-full table-fixed divide-y divide-gray-200">
        <thead class="hidden md:table-header-group">
          <tr class="text-left text-gray-500 uppercase text-sm">
            <th class="py-2 px-3 w-1/3">Company</th>
            <th class="py-2 px-3 w-1/3">Agent</th>
            <th class="py-2 px-3 w-1/3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="company in companies"
            :key="company.id"
            class="block md:table-row hover:bg-gray-50 border md:border-0 rounded-xl md:rounded-none p-3 md:p-0 mb-4 md:mb-0"
          >
            <!-- Company Name -->
            <td class="block md:table-cell py-3 px-3 font-medium text-gray-800 truncate">
              <span class="md:hidden text-gray-500 text-xs uppercase">Company:</span>
              <div>{{ company.companyName }}</div>
            </td>

            <!-- Assigned Agent -->
            <td class="block md:table-cell py-3 px-3 truncate">
              <span class="md:hidden text-gray-500 text-xs uppercase">Assigned Agent:</span>
              <div>
                <span v-if="company.agent">
                  {{ company.agent.firstName }} {{ company.agent.lastName }}
                </span>
                <span v-else class="text-gray-400 italic">Unassigned</span>
              </div>
            </td>

            <!-- Agent Selector + Action -->
            <td class="block md:table-cell py-3 px-3">
              <div class="flex flex-col md:flex-row md:items-center md:justify-end gap-3 w-full">
                <select
                  v-model="selectedAgent[company.id]"
                  class="border border-gray-300 rounded-lg p-2 text-sm w-full md:w-auto flex-grow"
                >
                  <option disabled value="">Select Agent</option>
                  <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                    {{ agent.firstName }} {{ agent.lastName }}
                  </option>
                </select>

                <button
                  @click="assignAgent(company.id)"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-4 h-4"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span class="md:inline hidden">Save</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const companies = ref<any[]>([])
const agents = ref<any[]>([])
const selectedAgent = ref<Record<string, string>>({})

async function loadData() {
  // Get companies
  const res = await $fetch("/api/companies/list")
  companies.value = res.companies || []

  // Get agents
  const agentRes = await $fetch("/api/insurance-agent/list")
  agents.value = agentRes.agents || []
}

async function assignAgent(companyId: string) {
  const agentId = selectedAgent.value[companyId]
  if (!agentId) return alert("Please select an agent first")

  await $fetch("/api/companies/assign-agent", {
    method: "POST",
    body: { companyId, agentId },
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
