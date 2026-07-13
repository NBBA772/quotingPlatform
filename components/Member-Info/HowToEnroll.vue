<template>
  <!-- How to Enroll Section -->
  <div class="mx-auto px-6 py-8 text-center lg:px-8">
    <h2 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
      How Can I Enroll?
    </h2>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 text-left">
      
      <!-- Left Column: Stacked Cards -->
      <div class="space-y-6 w-full">
        <!-- Card 1 -->
        <div class="flex items-start p-6 rounded-lg bg-white dark:bg-[#3a4934] shadow w-full">
          <Icon name="mdi:credit-card-check" class="text-indigo-600 dark:text-indigo-400 w-8 h-8 mr-4 mt-1" />
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Enrollment Fee</h3>
            <p class="text-white dark:text-gray-400">$99 one-time fee</p>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="flex items-start p-6 rounded-lg bg-white dark:bg-[#3a4934] shadow w-full">
          <Icon name="mdi:calendar-month" class="text-teal-600 dark:text-teal-400 w-8 h-8 mr-4 mt-1" />
          <div>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Monthly Dues</h3>
            <p class="text-white dark:text-gray-400">$24.95 per month</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Paragraphs -->
      <div class="flex flex-col justify-center w-full space-y-6">
        <p class="text-lg leading-8 text-gray-500 dark:text-white">
          Complete the enrollment form and submit your one-time enrollment fee along with your first monthly membership dues. Enrollment can be completed through your NBBA representative or via the official NBBA website.
        </p>

        <p class="text-lg leading-8 text-gray-500 dark:text-white">
          After payment is processed, you'll receive a welcome confirmation and gain access to the NBBA member portal where all benefits and resources can be managed.
        </p>
      </div>
    </div>
  </div>
</template>
