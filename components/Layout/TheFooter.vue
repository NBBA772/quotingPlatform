<template>
  <footer class="bg-[#333333] text-white dark:bg-[#142610] py-6 transition duration-500">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-center">
        
        <!-- Column 1: NBBA -->
        <div>
          <NuxtLink to="/" class="inline-flex items-center justify-center md:justify-start">
            <span class="text-lg font-bold text-white dark:text-white">NBBA</span>
          </NuxtLink>
          <p class="text-sm text-white  dark:text-gray-400 mt-2">
            National Business Benefit Alliance
          </p>
        </div>

        <!-- Column 2: Copyright -->
        <div>
          <p class="text-sm text-white  dark:text-gray-400">
            © 2025 <NuxtLink to="/" class="hover:underline">National Business Benefit Alliance.</NuxtLink>. All Rights Reserved.
          </p>
        </div>

        <!-- Column 3: Legal Links -->
        <div class="flex flex-col space-y-2 md:items-end">
          <NuxtLink to="#" class="text-sm text-white hover:text-white dark:text-gray-400 dark:hover:text-white">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="#" class="text-sm text-white hover:text-white dark:text-gray-400 dark:hover:text-white">
            Terms of Service
          </NuxtLink>
          <NuxtLink to="#" class="text-sm text-white hover:text-white dark:text-gray-400 dark:hover:text-white">
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
