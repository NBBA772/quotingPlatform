<template>
  <div class="mx-auto bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <table class="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <thead class="bg-gray-100 dark:bg-[#142610]">
        <tr>
          <th v-for="col in 6" :key="col" class="p-3 border-b dark:border-gray-700">
            <div class="h-4 w-24 bg-gray-200 dark:bg-[#3a4934] rounded animate-pulse"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in 25" :key="n" class="hover:bg-gray-50 dark:hover:bg-[#2d3a2a]">
          <td v-for="col in 5" :key="col" class="p-3 border-b dark:border-gray-700">
            <div class="h-5 w-full bg-gray-200 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
          </td>
          <td class="p-3 border-b dark:border-gray-700">
            <div class="h-7 w-20 bg-gray-300 dark:bg-[#2d3a2a] rounded animate-pulse"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
