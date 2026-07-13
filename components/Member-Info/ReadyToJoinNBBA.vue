<template>
  <section
    class="w-full p-8 bg-gradient-to-r from-[#046937] to-[#035a2e] text-center text-gray-300"
  >
    <!-- Heading -->
    <p class="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-white">
      Ready to Join NBBA?
    </p>

    <!-- Subheading -->
    <h2 class="mb-8 font-medium leading-snug text-white max-w-2xl mx-auto text-base md:text-lg">
    Your business's success is our mission. We’ll ensure you get the support and motivation needed to build the company of your dreams.
    </h2>


    <!-- One-row: Button + Text -->
    <div class="flex flex-col md:flex-row justify-center items-center gap-4 text-white font-medium text-lg">
      <!-- Phone Button -->
      <a
        href="tel:8889526247"
        class="inline-flex items-center gap-2 px-5 py-2 bg-white text-[#046937] border border-[#046937] hover:bg-[#046937] hover:text-white rounded-md transition text-base font-semibold"
      >
        <Icon name="mdi:phone" class="w-5 h-5" />
        Call (888) 952-6247
      </a>

      <!-- Divider (only on larger screens) -->
      <span class="hidden md:inline">|</span>

      <!-- Contact Info -->
      <span>Contact your local NBBA representative to enroll</span>
    </div>

    <!-- Enrollment Info -->
    <div class="mt-6 p-6 rounded-lg mx-auto bg-white/10 ">
      <p class="text-base md:text-lg font-semibold mb-2 text-white">Enrollment Benefits Take Effect</p>

      <p class="text-base md:text-lg leading-7 text-white">
        If enrolled before the 15th of each month, benefits will take effect on the first day of the following month.
      </p>
    </div>
  </section>
      <footer class="bg-[#023047] dark:bg-[#142610] text-white py-10">
        <div class="container mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold mb-2">
            National Business Benefit Alliance
        </h3>
        <p class="text-gray-300 mb-4">
            Dedicated to boosting small businesses across America
        </p>
        <p class="text-lg font-semibold flex justify-center items-center gap-2">
            <Icon name="lucide:phone" class="w-5 h-5 text-white" />
            (888) 952-6247
        </p>
        </div>
    </footer>
</template>
