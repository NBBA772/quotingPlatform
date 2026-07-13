<template>
  <section
    class="w-full p-8 text-gray-300 dark:text-gray-300 text-center relative bg-cover bg-center bg-no-repeat"
    style="background-image: url('/img/benefits.jpg');"
  >
    <!-- Black overlay for readability -->
    <div class="absolute inset-0 bg-black/60 z-0"></div>

    <!-- Content -->
    <div class="relative z-10">
      <div
        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 mb-6 bg-white/20 text-white border-white/30"
      >
        2025-2026 Member Guide
      </div>

      <p class="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-white">
        NBBA Member Benefits
      </p>

      <h1 class="mb-10 font-extrabold tracking-tight leading-snug text-white max-w-3xl mx-auto">
        A Comprehensive Overview of Services for Small Business Success
      </h1>

      <!-- Centered Paragraph in Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
        <div class="col-span-full max-w-3xl mx-auto">
          <p class="mt-6 text-lg leading-8 text-white">
            The National Business Benefit Alliance (NBBA) is dedicated to boosting small businesses. We recognize the crucial role small businesses play in our economy and communities and commit to equipping them with the necessary resources and support for success.
          </p>
        </div>

        <!-- ✅ Centered Button Across Grid -->
        <div class="col-span-full flex justify-center mt-6">
          <a
            href="tel:8889526247"
            class="inline-flex items-center gap-3 px-6 py-3 bg-white text-[#046937] border border-[#046937] hover:bg-[#046937] hover:text-white text-sm font-semibold rounded-md transition"
          >
            <Icon name="mdi:phone" class="w-6 h-6" />
            Call (888) 952-6247 to Enroll
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
