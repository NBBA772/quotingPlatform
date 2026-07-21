<template>
  <div class="max-w-3xl mx-auto p-6 my-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">Reset Password</h2>
      <button
        type="button"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        @click="open = !open"
      >
        {{ open ? 'Close' : 'Change Password' }}
      </button>
    </div>

    <form v-if="open" class="mt-4 space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Current Password</label>
        <input type="password" v-model="form.currentPassword" required autocomplete="current-password"
              class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">New Password</label>
          <input type="password" v-model="form.newPassword" required autocomplete="new-password"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Confirm New Password</label>
          <input type="password" v-model="confirm" required autocomplete="new-password"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white" />
        </div>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-400">At least 8 characters. You'll use this the next time you sign in.</p>

      <p v-if="error" class="text-red-600 dark:text-red-400">{{ error }}</p>
      <p v-if="message" class="text-green-600 dark:text-green-400">{{ message }}</p>

      <div class="flex justify-end">
        <button type="submit" :disabled="saving"
                class="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 dark:bg-[#046937] dark:hover:bg-[#058a45]">
          {{ saving ? 'Updating…' : 'Update Password' }}
        </button>
      </div>
    </form>

    <p v-else-if="message" class="mt-3 text-green-600 dark:text-green-400">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useCookie } from '#imports'

const authToken = useCookie('auth_token')

const open = ref(false)
const blank = () => ({ currentPassword: '', newPassword: '' })
const form = reactive(blank())
const confirm = ref('')
const saving = ref(false)
const error = ref('')
const message = ref('')

async function submit() {
  error.value = ''
  message.value = ''

  if (form.newPassword.length < 8) {
    error.value = 'New password must be at least 8 characters.'
    return
  }
  if (form.newPassword !== confirm.value) {
    error.value = 'New passwords do not match.'
    return
  }

  saving.value = true
  try {
    await $fetch('/api/user/change-password', {
      method: 'POST',
      headers: authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {},
      body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
    })
    message.value = 'Your password has been updated.'
    Object.assign(form, blank())
    confirm.value = ''
    open.value = false
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Failed to update password'
  } finally {
    saving.value = false
  }
}
</script>
