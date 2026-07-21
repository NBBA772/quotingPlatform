<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold dark:text-white">Add Agent Manager (Upline)</h2>
      <button
        type="button"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        @click="open = !open"
      >
        {{ open ? 'Close' : '+ Add Manager' }}
      </button>
    </div>

    <form v-if="open" class="mt-4 space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">First Name</label>
          <input type="text" v-model="form.firstName" required
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Last Name</label>
          <input type="text" v-model="form.lastName" required
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email</label>
          <input type="email" v-model="form.email" required
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Username</label>
          <input type="text" v-model="form.username" required
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Password</label>
          <input type="password" v-model="form.password" required
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Confirm Password</label>
          <input type="password" v-model="passwordConfirm" required
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-400">
        The manager logs in with their email and this password, and sees their downline agents and numbers.
      </p>

      <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
      <p v-if="message" class="text-green-600 dark:text-green-400">{{ message }}</p>

      <div class="flex justify-end">
        <button type="submit" :disabled="saving"
                class="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]">
          {{ saving ? 'Creating…' : 'Create Manager Login' }}
        </button>
      </div>
    </form>

    <p v-else-if="message" class="mt-3 text-green-600 dark:text-green-400">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useCookie } from '#imports'

const emit = defineEmits<{ (e: 'created'): void }>()

const open = ref(false)
const authToken = useCookie('auth_token')

const blank = () => ({ firstName: '', lastName: '', email: '', username: '', password: '' })
const form = reactive(blank())
const passwordConfirm = ref('')
const saving = ref(false)
const error = ref('')
const message = ref('')

let usernameEdited = false
watch(() => form.username, (v) => { if (v && v !== form.email) usernameEdited = true })
watch(() => form.email, (v) => { if (!usernameEdited) form.username = v })

async function submit() {
  error.value = ''
  message.value = ''
  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  if (form.password !== passwordConfirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  saving.value = true
  try {
    await $fetch('/api/agent-admin/register', {
      method: 'POST',
      headers: authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {},
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        username: form.username || form.email,
        password: form.password,
      },
    })
    message.value = `Manager login created for ${form.firstName} ${form.lastName} (${form.email}).`
    Object.assign(form, blank())
    passwordConfirm.value = ''
    usernameEdited = false
    emit('created')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to create manager login'
  } finally {
    saving.value = false
  }
}
</script>
