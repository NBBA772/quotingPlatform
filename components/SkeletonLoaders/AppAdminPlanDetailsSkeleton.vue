<template>
  <div class="plan-details p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
    <h2 class="font-bold text-lg mb-2">Plan Details (Loading)</h2>

    <ul class="space-y-2">
      <li class="flex flex-col gap-2">
        <!-- Plan Name / Type / Coverage -->
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>

        <!-- Button groups -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col gap-2">
            <div class="h-5 w-32 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
            <div class="flex gap-2">
              <div class="h-9 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
              <div class="h-9 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="h-5 w-32 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
            <div class="flex gap-2">
              <div class="h-9 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
              <div class="h-9 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="h-5 w-32 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
            <div class="flex gap-2">
              <div class="h-9 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
              <div class="h-9 w-16 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Action buttons -->
    <div class="mt-3 flex gap-3">
      <div class="h-9 w-28 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
      <div class="h-9 w-28 bg-gray-300 dark:bg-[#3a4934] rounded animate-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed, fully self-contained
</script>
