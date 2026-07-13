<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center space-x-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-[#046937]">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h1 class="text-3xl font-bold text-gray-900">Register App Admin</h1>
        </div>
        <p class="text-lg text-gray-900 max-w-2xl mx-auto">
          Create your AppAdmin account to manage the NBBA platform.
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="registerAppAdmin" class="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <input v-model="form.firstName" type="text" placeholder="First Name" class="w-full border rounded-lg p-3" required />
        <input v-model="form.lastName" type="text" placeholder="Last Name" class="w-full border rounded-lg p-3" required />
        <input v-model="form.email" type="email" placeholder="Email" class="w-full border rounded-lg p-3" required />
        <input v-model="form.username" type="text" placeholder="Username" class="w-full border rounded-lg p-3" required />
        <input v-model="form.password" type="password" placeholder="Password" class="w-full border rounded-lg p-3" required />
        
        <button type="submit"
          class="w-full bg-[#046937] text-white py-3 rounded-lg hover:bg-[#03582f] transition">
          Register
        </button>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: ''
})

async function registerAppAdmin() {
  try {
    const response = await $fetch('/api/register-admin', {
      method: 'POST',
      body: form.value,
    })

    alert('✅ AppAdmin account created successfully!')
    console.log(response)
    window.location.href = '/login'
  } catch (err: any) {
    console.error('Error registering AppAdmin:', err)
    alert(err?.data?.statusMessage || 'Failed to register AppAdmin')
  }
}
</script>
