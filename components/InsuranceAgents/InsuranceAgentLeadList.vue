<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <CompanyRegistrationStats />
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">My Leads</h2>
<div class="flex justify-between items-center mb-6">
  <div class="flex space-x-2">
    <button
      :class="['px-4 py-2 rounded', activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#142610] dark:text-white']"
      @click="activeTab = 'all'"
    >
      New Leads
    </button>

    <button
      :class="['px-4 py-2 rounded', activeTab === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#142610] dark:text-white']"
      @click="activeTab = 'inactive'"
    >
      Inactive Leads
    </button>

    <button
      :class="['px-4 py-2 rounded', activeTab === 'voicemail' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#142610] dark:text-white']"
      @click="activeTab = 'voicemail'"
    >
      Voicemail
    </button>

    <button
      :class="['px-4 py-2 rounded', activeTab === 'callback' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#142610] dark:text-white']"
      @click="activeTab = 'callback'"
    >
      Call Back
    </button>

    <button
      :class="['px-4 py-2 rounded', activeTab === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#142610] dark:text-white']"
      @click="activeTab = 'closed'"
    >
      Closed
    </button>

    <button
      :class="['px-4 py-2 rounded', activeTab === 'archievedLeads' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#142610] dark:text-white']"
      @click="activeTab = 'archievedLeads'"
    >
      Archieved Leads
    </button>
  </div>

  <!-- Toggle component pushed to the right -->
  <InsuranceAgentAvailabilityToggle />
</div>



    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading leads...</div>

    <div v-else>
    <component
      :is="
        activeTab === 'all' ? 'LeadsTable' :
        activeTab === 'inactive' ? 'InactiveLeads' :
        activeTab === 'voicemail' ? 'LeadsTableVoicemail' :
        activeTab === 'callback' ? 'LeadsTableCallback' :
        activeTab === 'closed' ? 'ClosedLeads' :
        activeTab === 'archievedLeads' ? 'ArchievedLeads' :
        'LeadsTable'
      "
      :key="activeTab"
    />



      <div v-if="leads.length === 0" class="text-gray-500 dark:text-gray-300 mt-4">
        No leads found.
      </div>

      <p v-if="message" class="mt-4 text-green-600 dark:text-green-400">{{ message }}</p>
      <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

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

const activeTab = ref<'all' | 'inactive' | 'voicemail' | 'callback' | 'closed' | 'archievedLeads'>('all')


// Fetch initial leads
const fetchLeads = async () => {
  try {
    const authToken = useCookie('auth_token').value
    const { data } = await useFetch('/api/leads/services/list', {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    leads.value = data.value || []
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
      // Update in local table
      const idx = leads.value.findIndex(l => l.id === editingLead.value.id)
      if (idx !== -1) leads.value[idx] = { ...editingLead.value }
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
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-enter-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-active {
  transition: all 0.4s ease;
  position: absolute; /* prevents collapse jump */
  width: 100%;
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}


</style>