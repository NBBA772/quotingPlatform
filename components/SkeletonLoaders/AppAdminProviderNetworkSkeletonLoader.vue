<template>
  <ul class="space-y-4">
    <li v-for="n in 3" :key="n" class="border-b pb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
      </div>
      <div class="h-6 w-20 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse mt-2"></div>
    </li>
  </ul>
</template>
