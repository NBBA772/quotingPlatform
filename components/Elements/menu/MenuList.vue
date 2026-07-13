<template>
  <nav class="hidden md:flex items-center justify-between">
    <!-- Left links -->
    <div class="hidden md:flex justify-between space-x-10 items-center text-white dark:text-gray-200 mt-14">
      <!-- Home Link -->
      <nuxt-link to="/" class="relative group">
        <span
          :class="[
            'text-base font-medium transition-colors duration-300 px-3 py-1 rounded-md',
            isActive('/')
              ? 'text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-500'
              : 'text-gray-500 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#3a4934] hover:text-gray-900 dark:hover:text-gray-300',
          ]"
        >
          Home
        </span>
      </nuxt-link>

      <!-- Member Info -->
      <nuxt-link to="/Member-Info/" class="relative group">
        <span
          :class="[
            'text-base font-medium transition-colors duration-300 px-3 py-1 rounded-md',
            isPortfolioActive
              ? 'text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-500'
              : 'text-gray-500 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#3a4934] hover:text-gray-900 dark:hover:text-gray-300',
          ]"
        >
          Member Info
        </span>
      </nuxt-link>

      <!-- Dashboard (only show if logged in) -->
      <nuxt-link
        v-if="loggedIn"
        to="/dashboard/"
        class="relative group"
      >
        <span
          :class="[
            'text-base font-medium transition-colors duration-300 px-3 py-1 rounded-md',
            isActive('/dashboard')
              ? 'text-gray-900 dark:text-gray-300 bg-gray-200 dark:bg-gray-500'
              : 'text-gray-500 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-[#3a4934] hover:text-gray-900 dark:hover:text-gray-300',
          ]"
        >
          Dashboard
        </span>
      </nuxt-link>
    </div>

    <!-- Right icons -->
    <div class="flex items-center">
      <IconList class="ml-6" />
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useAuthCookie } from "~/composables/useAuth"; // adjust if different

const route = useRoute();
const user = useAuthCookie(); // returns user or null

const loggedIn = computed(() => !!user.value);

const isActive = (path) => route.path === path;

const isPortfolioActive = computed(() =>
  route.path.startsWith("/categories") ||
  route.path.startsWith("/tags") ||
  route.path.startsWith("/portfolio/")
);
</script>
