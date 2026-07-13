<template>
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
    <transition-group name="lead">
      <template v-for="(lead, index) in leads" :key="lead.id">
        <tr
          class="hover:bg-gray-50 dark:hover:bg-[#2d3a2a]"
          :style="{ animationDelay: `${index * 100}ms` }"
        >

          <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.firstName }}</td>
          <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.lastName }}</td>
          <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.email }}</td>
          <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.phone }}</td>
          <td class="p-3 border-b dark:border-gray-700 dark:text-white">{{ lead.policyType }}</td>
          <td class="p-3 border-b dark:border-gray-700 dark:text-white relative">
            <button
              :id="`button-${lead.id}`"
              @click="(e) => openMenu(lead, e)"
              class="bg-gray-200 dark:bg-[#142610] px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-[#058a45] transition"
            >
              Actions
            </button>
          </td>
        </tr>

        <!-- Teleport menu outside the table -->
        <teleport to="body">
          <div
            v-if="lead.menuOpen"
            :id="`menu-${lead.id}`"
            class="absolute z-50 bg-white dark:bg-[#142610] border border-gray-200 dark:border-gray-700 rounded shadow-lg w-56"
            :style="{ top: `${lead.menuTop}px`, left: `${lead.menuLeft}px` }"
          >
            <button
              @click="() => { sendInvite(lead.email, lead.id); lead.menuOpen = false }"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
            >
              {{ sendingEmails[lead.id] ? 'Sending...' : 'Invite Lead' }}
            </button>

            <CallLeadButton
              :leadPhone="lead.phone"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
              @click.native="lead.menuOpen = false"
            />

            <button
              @click="() => { startEditLead(lead); lead.menuOpen = false }"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
            >
              Edit Lead
            </button>

            <button
              @click="() => { startAddNote(lead); lead.menuOpen = false }"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
            >
              Notes
            </button>

            <button
              @click="() => { softDeleteLead(lead.id); lead.menuOpen = false }"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934] text-red-600"
            >
              Delete Lead
            </button>




            <!-- <button
              @click="() => { console.log('Another action'); lead.menuOpen = false }"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3a4934]"
            >
              Another Action
            </button> -->
          </div>
        </teleport>
      </template>
    </transition-group>
  </tbody>
      </table>
        <teleport to="body">
        <div
            v-if="showEditModal"
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
            <div class="bg-white dark:bg-[#142610] rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Lead</h3>

            <div class="space-y-3">
                <input v-model="editingLead.firstName" placeholder="First Name"
                class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white" />
                <input v-model="editingLead.lastName" placeholder="Last Name"
                class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white" />
                <input v-model="editingLead.email" placeholder="Email"
                class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white" />
                <input v-model="editingLead.phone" placeholder="Phone"
                class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white" />
                <input v-model="editingLead.policyType" placeholder="Policy Type"
                class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white" />

                  <select v-model="editingLead.status"
                    class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white">
                   <option value="inactive">Inactive</option>
                    <option value="voicemail">Voicemail</option>
                    <option value="call_back">Call Back</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            <div class="flex justify-end space-x-2 mt-4">
                <button @click="showEditModal = false"
                class="px-4 py-2 bg-gray-300 dark:bg-[#3a4934] rounded hover:bg-gray-400 dark:hover:bg-[#058a45]">
                Cancel
                </button>
                <button @click="saveLead"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
                </button>
            </div>
            </div>
        </div>
        </teleport>
        <teleport to="body">
        <div v-if="showNoteModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white dark:bg-[#142610] rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Notes for Lead #{{ noteLeadId }}
            </h3>

            <!-- Existing notes -->
            <div v-if="leadNotes.length" class="space-y-2 mb-4 max-h-40 overflow-y-auto">
                <div v-for="note in leadNotes" :key="note.id" class="p-2 border rounded bg-gray-50 dark:bg-[#3a4934]">
                <p class="text-sm text-gray-800 dark:text-white">{{ note.content }}</p>
                <p class="text-xs text-gray-500">{{ new Date(note.createdAt).toLocaleString() }}</p>
                </div>
            </div>
            <div v-else class="text-gray-400 mb-4">No notes yet.</div>

            <!-- Add new note -->
            <textarea
                v-model="noteContent"
                class="w-full p-2 border rounded dark:bg-[#3a4934] dark:text-white"
                rows="3"
                placeholder="Write a note..."
            />

            <div class="flex justify-end space-x-2 mt-4">
                <button
                @click="showNoteModal = false"
                class="px-4 py-2 bg-gray-300 dark:bg-[#3a4934] rounded hover:bg-gray-400 dark:hover:bg-[#058a45]"
                >
                Close
                </button>
                <button
                @click="saveNote"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Save Note
                </button>
            </div>
            </div>
        </div>
        </teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useCookie } from '#imports'
import Cookies from 'js-cookie'

const leads = ref<any[]>([])
const loading = ref(true)
const message = ref('')
const error = ref('')
const sendingEmails = reactive<Record<number, boolean>>({})
let sse: EventSource | null = null




// Fetch initial leads
const fetchLeads = async () => {
    loading.value = true
  try {
    const authToken = useCookie('auth_token').value
    const { data } = await useFetch(`/api/leads/services/list-inactive?status=inactive`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    leads.value = data.value.leads || []
  } catch (err) {
    console.error('Failed to fetch leads:', err)
  } finally {
    loading.value = false
  }
}

// Send invite email
const sendInvite = async (email: string, leadId?: number) => {
  if (leadId) sendingEmails[leadId] = true
  message.value = ''
  error.value = ''

  try {
    const authToken = Cookies.get('auth_token')
    if (!authToken) throw new Error('No auth token found')

    const response = await $fetch('/api/leads/send-invite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { email, leadId },
    })

    if (response.success) {
      message.value = `Invite sent successfully to ${email}`
    } else {
      throw new Error('Failed to send invite')
    }
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Error sending invite'
  } finally {
    if (leadId) sendingEmails[leadId] = false
  }
}

// Dropdown menu tracking
let openLead: any = null
const openMenu = (lead: any, event: MouseEvent) => {
  if (openLead && openLead !== lead) openLead.menuOpen = false
  lead.menuOpen = !lead.menuOpen
  openLead = lead.menuOpen ? lead : null

  const rect = (event.target as HTMLElement).getBoundingClientRect()
  lead.menuTop = rect.bottom + window.scrollY
  lead.menuLeft = rect.right + window.scrollX - 224
}

const handleClickOutside = (event: MouseEvent) => {
  if (!openLead) return
  const menuEl = document.getElementById(`menu-${openLead.id}`)
  const buttonEl = document.getElementById(`button-${openLead.id}`)
  if (
    menuEl && !menuEl.contains(event.target as Node) &&
    buttonEl && !buttonEl.contains(event.target as Node)
  ) {
    openLead.menuOpen = false
    openLead = null
  }
}


// SSE subscription for real-time leads
const subscribeToLeads = () => {
  const authToken = Cookies.get('auth_token')
  if (!authToken) {
    console.log('[SSE] No auth token found on client')
    return
  }

  console.log('[SSE] Connecting to leads stream...')
  sse = new EventSource('/api/leads/services/stream')

  sse.onopen = () => console.log('[SSE] Connection opened')
  sse.onmessage = (event) => {
    try {
      console.log('[SSE] Message received:', event.data)
      const newLead = JSON.parse(event.data)
      newLead.menuOpen = false
      leads.value.unshift(newLead)
      console.log('[SSE] Lead added:', newLead)
    } catch (err) {
      console.error('[SSE] Invalid message:', err)
    }
  }

  sse.onerror = (err) => console.error('[SSE] SSE error:', err)
}

const editingLead = ref<any | null>(null)
const showEditModal = ref(false)

const startEditLead = (lead: any) => {
  editingLead.value = { ...lead } // clone so we don’t mutate table directly
  showEditModal.value = true
}

const saveLead = async () => {
  try {
    const authToken = Cookies.get('auth_token')
    if (!authToken) throw new Error('No auth token found')

    const response = await $fetch(`/api/leads/${editingLead.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: editingLead.value,
    })

    if (response.success) {
      const idx = leads.value.findIndex(l => l.id === editingLead.value.id)

      if (idx !== -1) {
        // if status is voicemail/call_back → animate out
        if (["voicemail", "call_back", "inactive", "closed"].includes(editingLead.value.status)) {
          leads.value.splice(idx, 1) // this triggers transition-group leave animation
        } else {
          // otherwise just update row
          leads.value[idx] = { ...editingLead.value }
        }
      }

      showEditModal.value = false
      message.value = 'Lead updated successfully'
    }
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to update lead'
  }
}

const showNoteModal = ref(false)
const noteLeadId = ref<number | null>(null)
const noteContent = ref('')
const leadNotes = ref<any[]>([])

const startAddNote = async (lead: any) => {
  noteLeadId.value = lead.id
  noteContent.value = ''
  showNoteModal.value = true
  await fetchNotes(lead.id)
}

const fetchNotes = async (leadId: number) => {
  try {
    const authToken = Cookies.get('auth_token')
    const res = await $fetch(`/api/leads/${leadId}/notes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    leadNotes.value = res.notes || []
  } catch (err) {
    console.error("Failed to fetch notes", err)
    leadNotes.value = []
  }
}

const saveNote = async () => {
  if (!noteContent.value.trim() || !noteLeadId.value) return

  try {
    const authToken = Cookies.get('auth_token')
    await $fetch(`/api/leads/${noteLeadId.value}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { content: noteContent.value },
    })

    noteContent.value = ''
    await fetchNotes(noteLeadId.value) // refresh list
    message.value = 'Note added successfully'
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to add note'
  }
}

const softDeleteLead = async (leadId: number) => {
  try {
    const authToken = Cookies.get('auth_token')
    await $fetch(`/api/leads/${leadId}/delete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
    })

    leads.value = leads.value.filter(l => l.id !== leadId)
    message.value = 'Lead deleted successfully'
  } catch (err: any) {
    console.error(err)
    error.value = err?.message || 'Failed to delete lead'
  }
}





onMounted(() => {
  fetchLeads()
  subscribeToLeads()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (sse) sse.close()
})
</script>

<style scoped>
.lead-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.lead-enter-active {
  transition: all 0.3s ease;
}
.lead-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.lead-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.lead-leave-active {
  transition: all 0.3s ease;
}
.lead-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.lead-enter-active {
  animation: fallIn 0.65s ease forwards;
}

@keyframes fallIn {
  0%   { transform: translateY(-80px) rotate(-8deg); opacity: 0; }
  40%  { transform: translateY(20px) rotate(5deg); opacity: 0.7; }
  70%  { transform: translateY(-10px) rotate(-2deg); opacity: 0.9; }
  100% { transform: translateY(0) rotate(0); opacity: 1; }
}

.lead-leave-active {
  animation: fallAway 0.65s ease forwards;
}

@keyframes fallAway {
  0%   { transform: translateY(0) rotate(0); opacity: 1; }
  40%  { transform: translateY(-20px) rotate(-5deg); opacity: 0.6; }
  100% { transform: translateY(80px) rotate(8deg); opacity: 0; }
}




</style>