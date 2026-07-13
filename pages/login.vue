<template>
  <div class="min-h-screen grid grid-cols-1 md:grid-cols-5 bg-gray-100 dark:bg-[#142610]">
    <!-- Left: Login Form -->
    <div class="md:col-span-2 flex items-center flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 min-h-screen">
      <div class="w-full max-w-xl">
        <div class="w-full max-w-xl">
          <div class="p-8 bg-white dark:bg-[#3a4934] border border-gray-200 dark:border-gray-700 rounded-lg shadow space-y-6">
            
            <!-- Welcome Text -->
            <div class="mb-16">
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Welcome to NBBA</h2>
              <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">
                Log in to your account or create a new one to access member benefits.
              </p>
            </div>

            <!-- Error messages -->
            <div
              v-if="response?.hasErrors && errors"
              class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <ul>
                <ul>
                <li v-for="[key, value] in errorEntries" :key="key">
                  {{ value.message }}
                </li>
              </ul>
              </ul>
            </div>

            <!-- Login Form -->
            <form v-on:submit.prevent class="space-y-4">
              <div>
                <label for="username" class="sr-only">Email</label>
                <input
                  v-model="usernameOrEmail"
                  id="username"
                  name="username"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="Email"
                  class="dark:bg-slate-500 dark:text-white dark:placeholder-white w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  :class="hasError('username') ? 'border-red-500' : ''"
                />
              </div>

              <div>
                <label for="password" class="sr-only">Password</label>
                <input
                  v-model="password"
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  placeholder="Password"
                  class="dark:bg-slate-500 dark:text-white dark:placeholder-white w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  :class="hasError('password') ? 'border-red-500' : ''"
                />
              </div>

              <button
                @click.prevent="postLoginForm"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Icon name="lucide:lock" class="w-5 h-5 mr-2" />
                Login
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>

    <!-- Right: Info Panel -->
    <div class="relative md:col-span-3 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 text-white">
      <!-- 🔹 Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center" 
        style="background-image: url('/img/business-people.jpg');"
      ></div>

      <!-- 🔹 Black Overlay -->
      <div class="absolute inset-0 bg-black/60"></div>

      <!-- 🔹 Content -->
      <div class="relative w-full max-w-3xl mx-auto space-y-8">
        <h2 class="text-3xl lg:text-4xl font-extrabold">
          National Business Benefit Alliance
        </h2>
        <p class="text-lg text-gray-200">
          Member Benefits
        </p>

        <div class="space-y-6 text-left">
          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
              1
            </div>
            <div>
              <p class="text-lg font-semibold">Business Education Resources</p>
              <p class="text-base text-gray-200">
                Access exclusive business training materials and resources.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
              2
            </div>
            <div>
              <p class="text-lg font-semibold">Professional Services</p>
              <p class="text-base text-gray-200">
                Take advantage of discounted professional services for your business.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
              3
            </div>
            <div>
              <p class="text-lg font-semibold">Insurance Coverage</p>
              <p class="text-base text-gray-200">
                Get access to specialized insurance options for your business needs.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
              4
            </div>
            <div>
              <p class="text-lg font-semibold">Networking Opportunities</p>
              <p class="text-base text-gray-200">
                Connect with other member businesses and potential partners.
              </p>
            </div>
          </div>
        </div>

        <!-- 🔽 Register / Join Buttons -->
        <div class="mt-16 space-y-2 text-sm">
          <h4 class="font-medium mb-2">New to NBBA?</h4>
          <div>
            <NuxtLink
              to="/register"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border bg-white/10 hover:bg-white/20 h-10 px-4 py-2 w-full justify-start"
            >
              Register Your Business
            </NuxtLink>
          </div>
          <div>
            <NuxtLink
              to="/register-employee"
              class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border bg-white/10 hover:bg-white/20 h-10 px-4 py-2 w-full justify-start"
            >
              Join with Company Code
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { loginWithEmail } from '~/composables/useAuth'
import { Icon } from '#components'
import { useNuxtApp } from '#app'

const usernameOrEmail = ref('')
const password = ref('')

const errors: Ref<any> = ref(undefined)
let response: FormValidation

const errorEntries = computed(() => {
  const errorObj = errors.value?.errors || errors.value
  if (!errorObj) return []
  if (typeof errorObj.entries === 'function') {
    return Array.from(errorObj.entries())
  }
  return Object.entries(errorObj)
})

definePageMeta({
  middleware: 'guest',
})

async function postLoginForm() {
  response = await loginWithEmail(usernameOrEmail.value, password.value)
  if (response.hasErrors) {
    errors.value = response.errors // <-- just assign, don't map again!
  } else {
    errors.value = undefined
  }

  const toast = useNuxtApp().$toast

  if (response.hasErrors) {
    let firstErrorMsg = 'Login failed. Please check your credentials.'
    const errorObj = errors.value
    if (errorObj) {
      const first = Object.values(errorObj)[0]
      if (first?.message) firstErrorMsg = first.message
    }
    toast?.error?.(firstErrorMsg)
  } else {
    toast?.success?.('Login successful! Redirecting...')
  }
}

function hasError(field: string) {
  if (!errors.value) return false
  if (typeof errors.value.has === 'function') {
    return errors.value.has(field)
  }
  return !!errors.value[field]
}
</script>
