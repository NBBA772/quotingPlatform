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
          <h1 class="text-3xl font-bold text-gray-900">Join Your Company</h1>
        </div>
        <p class="text-lg text-gray-900 max-w-2xl mx-auto">
          Enter your company's business code to join their NBBA membership and access exclusive benefits.
        </p>
      </div>

      <!-- Form Card -->
      <div class="rounded-lg border bg-white shadow-sm">
        <!-- Card Header -->
        <div class="flex flex-col space-y-1.5 p-6">
          <div class="text-2xl font-semibold flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
              <path d="M10 6h4"></path>
              <path d="M10 10h4"></path>
              <path d="M10 14h4"></path>
              <path d="M10 18h4"></path>
            </svg>
            <span>Employee Registration</span>
          </div>
        </div>

        <!-- Form Body -->
        <div class="p-6 pt-0">
          <form @submit.prevent="joinCompany" class="space-y-6">
          <div v-if="errors && errors.size" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <ul>
              <li v-for="[key, value] in errors" :key="key">{{ value.message }}</li>
            </ul>
          </div>
            <!-- Company Code -->
            <div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div class="space-y-2">
                <label class="text-lg font-semibold text-blue-800" for="businessCode">Company Business Code</label>
                <input
                  type="text"
                  id="businessCode"
                  v-model="form.businessCode"
                  placeholder="Enter 6-digit business code"
                  maxlength="6"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  required
                />
                <p class="text-sm text-blue-600 mt-2">Get this code from your company administrator</p>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium" for="firstName">First Name</label>
                  <input type="text" id="firstName" v-model="form.firstName" placeholder="John"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    required />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium" for="lastName">Last Name</label>
                  <input type="text" id="lastName" v-model="form.lastName" placeholder="Doe"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    required />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium" for="email">Email Address</label>
                <input type="email" id="email" v-model="form.email" placeholder="john.doe@example.com"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  required />
                  <span v-if="errors?.get('email')" class="text-red-600 text-sm">
                    {{ errors.get('email').message }}
                  </span>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium" for="phone">Phone Number</label>
                <input type="tel" id="phone" v-model="form.phone" placeholder="(555) 123-4567"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  required />
                  <span v-if="errors?.get('phone')" class="text-red-600 text-sm">
                    {{ errors.get('phone').message }}
                  </span>
              </div>
            </div>

            <!-- Account Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold">Account Information</h3>
              <div class="space-y-2">
                <label class="text-sm font-medium" for="username">Username</label>
                <input type="text" id="username" v-model="form.username" placeholder="johndoe"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  required />
                  <span v-if="errors?.get('username')" class="text-red-600 text-sm">
                    {{ errors.get('username').message }}
                  </span>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium" for="password">Password</label>
                <input type="password" id="password" v-model="form.password" placeholder="Choose a secure password"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  required />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4">
              <NuxtLink to="/login" type="button"
                class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-gray-100 h-10 px-4">
                Back to Login
              </NuxtLink>
              <button type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 bg-[#046937] hover:bg-[#035a2e] text-white">
                Join Company
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 ml-2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-sm text-white">
          Don't have a business code? Contact your company administrator or
          <NuxtLink to="/register" class="text-[#046937] hover:underline font-medium">register your business</NuxtLink>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loginWithEmail } from '~/composables/useAuth'

const form = ref({
  businessCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: ''
})

const errors = ref<Map<string, { message: string }> | undefined>(undefined)

async function joinCompany() {
  try {
    await $fetch('/api/register-employee', {
      method: 'POST',
      body: form.value,
    })

    // Auto-login after registration
    const loginResult = await loginWithEmail(form.value.username, form.value.password)
    if (loginResult.hasErrors) {
      alert('Registered, but failed to auto-login. Please login manually.')
      window.location.href = '/login'
      return
    }
    // Redirect handled by loginWithEmail
  } catch (err: any) {
    // Map backend errors to a Map for display
    let errorData = err?.data?.data ?? err?.data ?? err?.errors ?? {}
    const map = new Map<string, { message: string }>()
    for (const [key, msg] of Object.entries(errorData)) {
      if (typeof msg === 'object' && msg !== null && 'message' in msg) {
        map.set(key, { message: String(msg.message) })
      } else {
        map.set(key, { message: String(msg) })
      }
    }
    errors.value = map
    console.error('Employee registration validation errors:', errorData)
  }
}

</script>
