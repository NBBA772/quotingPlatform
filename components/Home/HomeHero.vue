<template>
    <div class="max-w-7xl mx-auto px-6 py-24 text-center sm:py-16 lg:px-8">
      <h2 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-7xl">
        National Business Benefit Alliance
      </h2>
      <p class="mt-6 text-lg leading-8 text-white">
        Empowering entrepreneurs and business owners with the tools, resources, and network they need to thrive in today's competitive marketplace.
      </p>
      <p class="mt-4 text-md leading-7 text-gray-500">
        Join a community of forward-thinking business professionals committed to mutual success and growth.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <NuxtLink
          to="/login"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-11 rounded-md bg-[#046937] hover:bg-[#035a2e] text-white px-8 py-3"
        >
          Become a Member
        </NuxtLink>
        <NuxtLink
          to="/Member-Info"
          class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100  hover:text-blue-600"
        >
          Learn More <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
</template>

<script setup>
// No logic needed for now — purely presentational
</script>

<!-- Optional custom styles -->
<style scoped>
/* Add any scoped custom styles here if needed */
</style>
