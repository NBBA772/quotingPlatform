<template>
  <div class="plan-benefits p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
    <h2 class="font-bold text-lg mb-2">Plan Benefits</h2>

    <!-- Fake list of benefits -->
    <ul class="space-y-2">
      <li
        v-for="n in 3"
        :key="n"
        class="flex items-center gap-2"
      >
        <!-- Fake name input -->
        <div class="h-9 w-full bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>

        <!-- Fake description input -->
        <div class="h-9 w-full bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>

        <!-- Fake remove button -->
        <div class="h-6 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
      </li>
    </ul>

    <!-- Fake buttons -->
    <div class="flex gap-3 mt-4">
      <div class="h-9 w-28 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
      <div class="h-9 w-28 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
    </div>
  </div>
</template>
