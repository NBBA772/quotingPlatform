<template>
  <div class="p-6 bg-white dark:bg-[#3a4934] rounded-2xl shadow border border-gray-200 dark:border-gray-700">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Enrollee Agent Assignments</h2>

    <div class="overflow-x-auto">
      <table class="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="hidden md:table-header-group">
          <tr class="text-left text-gray-500 dark:text-gray-400 uppercase text-sm">
            <th class="py-2 px-3 w-1/3">Enrollee / Company</th>
            <th class="py-2 px-3 w-1/3">Agent</th>
            <th class="py-2 px-3 w-1/3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="company in companies"
            :key="company.id"
            class="block md:table-row hover:bg-gray-50 dark:hover:bg-[#2d3a2a] border md:border-0 dark:border-gray-700 rounded-xl md:rounded-none p-3 md:p-0 mb-4 md:mb-0"
          >
            <!-- Enrollee / Company name -->
            <td class="block md:table-cell py-3 px-3 font-medium text-gray-800 dark:text-white truncate">
              <span class="md:hidden text-gray-500 text-xs uppercase">Enrollee / Company:</span>
              <div class="flex items-center gap-2">
                <span>{{ company.companyName }}</span>
                <span class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#142610] text-gray-500 dark:text-gray-400">
                  {{ typeLabel(company.enrollmentType) }}
                </span>
              </div>
            </td>

            <!-- Assigned Agent -->
            <td class="block md:table-cell py-3 px-3 truncate text-gray-800 dark:text-gray-200">
              <span class="md:hidden text-gray-500 text-xs uppercase">Assigned Agent:</span>
              <div>
                <span v-if="company.agent">{{ company.agent.firstName }} {{ company.agent.lastName }}</span>
                <span v-else class="text-gray-400 italic">Unassigned</span>
              </div>
            </td>

            <!-- Actions menu -->
            <td class="block md:table-cell py-3 px-3 md:text-right">
              <div class="relative inline-block text-left">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#142610]"
                  @click="toggleMenu(company.id)"
                >
                  Actions
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <div
                  v-if="openMenuId === company.id"
                  class="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#142610] shadow-lg p-3 text-left"
                >
                  <!-- Assign agent -->
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Assign Agent</p>
                  <div class="flex items-center gap-2">
                    <select
                      v-model="selectedAgent[company.id]"
                      class="border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm flex-grow dark:bg-[#3a4934] dark:text-white"
                    >
                      <option disabled value="">Select Agent</option>
                      <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                        {{ agent.firstName }} {{ agent.lastName }}
                      </option>
                    </select>
                    <button
                      class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                      @click="assignAgent(company.id)"
                    >
                      Save
                    </button>
                  </div>

                  <div class="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                  <!-- Delete -->
                  <button
                    class="w-full flex items-center gap-2 text-left px-2 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-[#3a1f1f]"
                    @click="permanentDelete(company)"
                  >
                    <Icon name="mdi:delete-forever" size="20" />
                    Delete permanently
                  </button>
                </div>
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
import { useCookie } from "#imports"

const authToken = useCookie("auth_token").value
const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {}

const companies = ref<any[]>([])
const agents = ref<any[]>([])
const selectedAgent = ref<Record<string, string>>({})
const openMenuId = ref<number | null>(null)

const typeLabel = (t: string) =>
  t === "group" ? "Group" : t === "custom" ? "Custom Group" : "Individual / Family"

const toggleMenu = (id: number) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

async function loadData() {
  const res: any = await $fetch("/api/companies/list")
  companies.value = res.companies || []
  const agentRes: any = await $fetch("/api/insurance-agent/list")
  agents.value = agentRes.agents || []
}

async function assignAgent(companyId: number) {
  const agentId = selectedAgent.value[companyId]
  if (!agentId) return alert("Please select an agent first")
  await $fetch("/api/companies/assign-agent", { method: "POST", body: { companyId, agentId } })
  openMenuId.value = null
  await loadData()
}

async function permanentDelete(company: any) {
  if (!confirm(`PERMANENTLY delete "${company.companyName}" and all its enrollees/data? This cannot be undone.`)) return
  try {
    await $fetch(`/api/company/${company.id}/permanent`, { method: "DELETE", headers: authHeaders })
    companies.value = companies.value.filter((c) => c.id !== company.id)
    openMenuId.value = null
  } catch (err: any) {
    console.error("Error deleting company:", err)
    alert(err?.data?.statusMessage || "Failed to delete")
  }
}

onMounted(loadData)
</script>

<style scoped>
table {
  width: 100%;
}
</style>
