<template>
  <!-- 2-column parent grid, equal width -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
    <!-- Left column: Icon -->
    <div class="flex justify-center items-start">
      <img src="/img/senior-couple-health-check-medicare.jpg" />
    </div>

    <!-- Right column: Existing eligibility cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
      <div class="p-4 rounded-lg bg-white dark:bg-[#3a4934] shadow">
        <Icon name="mdi:briefcase" class="text-green-600 dark:text-green-400 mb-3 w-12 h-12 mx-auto" />
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Small Business Owners</h3>
        <p class="text-white dark:text-gray-400">
          Individuals actively running a small business.
        </p>
      </div>

      <div class="p-4 rounded-lg bg-white dark:bg-[#3a4934] shadow">
        <Icon name="mdi:account-multiple" class="text-blue-600 dark:text-blue-400 mb-3 w-12 h-12 mx-auto" />
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Under 49 Employees</h3>
        <p class="text-white dark:text-gray-400">
          Businesses with no more than 49 active employees.
        </p>
      </div>

      <div class="p-4 rounded-lg bg-white dark:bg-[#3a4934] shadow">
        <Icon name="mdi:badge-account" class="text-yellow-500 dark:text-yellow-300 mb-3 w-12 h-12 mx-auto" />
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Enrolled Business Employees</h3>
        <p class="text-white dark:text-gray-400">
          Employees of companies already enrolled in NBBA.
        </p>
      </div>

      <div class="p-4 rounded-lg bg-white dark:bg-[#3a4934] shadow">
        <Icon name="mdi:map-marker-radius" class="text-red-500 dark:text-red-400 mb-3 w-12 h-12 mx-auto" />
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">U.S. Registered Businesses</h3>
        <p class="text-white dark:text-gray-400">
          Must be registered in the U.S. (Excludes NY and MA).
        </p>
      </div>

      <div class="p-4 rounded-lg bg-white dark:bg-[#3a4934] shadow sm:col-span-2">
        <Icon name="mdi:file-document-check" class="text-purple-600 dark:text-purple-400 mb-3 w-12 h-12 mx-auto" />
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Required Documentation</h3>
        <p class="text-white dark:text-gray-400">
          Business license, articles of incorporation, or equivalent verification.
        </p>
      </div>
    </div>
  </div>
</template>
