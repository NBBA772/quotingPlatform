<template>
  <div class="max-w-7xl mx-auto px-6 py-24 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left: Text Content -->
      <div class="text-center lg:text-left">
        <h2
          class="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl"
        >
          Ready to Transform Your Business?
        </h2>
        <p class="mt-6 text-lg leading-8 text-gray-500 dark:text-white">
          Empowering entrepreneurs and business owners with the tools, resources,
          and network they need to thrive in today's competitive marketplace.
        </p>
        <p class="mt-4 text-md leading-7 text-gray-500 dark:text-white">
          Join the National Business Benefit Alliance today and gain access to the
          tools, resources, and network that will take your business to the next
          level.
        </p>

        <!-- CTA -->
        <div class="mt-10 flex flex-col sm:flex-row items-center sm:justify-start gap-6">
          <NuxtLink
            to="/login"
            class="inline-flex items-center justify-center gap-3 whitespace-nowrap text-sm font-medium h-11 rounded-md bg-[#046937] hover:bg-[#035a2e] text-white px-8 py-3 transition"
          >
            <Icon name="mdi:target" class="text-white w-7 h-7" />
            Start Your Membership
          </NuxtLink>
          <p
            class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-blue-600"
          >
            No long-term contracts • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>

      <!-- Right: Image -->
      <div class="relative w-full h-80 lg:h-full">
        <img
          src="/img/grow-business.jpg"
          alt="Business growth"
          class="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>
    </div>
  </div>
</template>
