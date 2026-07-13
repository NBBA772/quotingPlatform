<template>
  <div class="claims-support p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
    <h2 class="font-bold text-lg mb-2">Claims Support (Loading)</h2>

    <ul class="space-y-2">
      <li v-for="n in 3" :key="n" class="flex flex-col gap-2 border-b pb-2">
        <!-- Skeleton fields matching your inputs -->
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <div class="h-9 bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
        <!-- Skeleton remove button -->
        <div class="h-6 w-20 bg-gray-300 dark:bg-[#2d3a2a] rounded mt-2 animate-pulse"></div>
      </li>
    </ul>

    <!-- Skeleton action buttons -->
    <div class="mt-3 flex gap-3">
      <div class="h-9 w-28 bg-gray-300 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
      <div class="h-9 w-28 bg-gray-300 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
    </div>
  </div>
</template>

