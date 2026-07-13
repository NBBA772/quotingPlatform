<!-- MembershipBenefitsSlide.vue -->
<template>
  <div class="w-full h-full flex flex-col justify-center items-center overflow-y-auto p-6">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl md:text-6xl font-bold text-gray-100 mb-4 font-heading">
        Comprehensive Business Support Services
      </h1>
      <p class="mt-4 text-base md:text-lg text-gray-200">
        Access professional-grade services that would typically cost thousands of
        dollars, all included with your membership.
      </p>
    </div>

    <!-- Benefits Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
      <div
        v-for="(benefit, index) in benefits"
        :key="index"
        class="rounded-lg bg-white/90 dark:bg-[#142610]/90 shadow p-4 flex items-start space-x-3"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
          <Icon :name="benefit.icon" class="h-6 w-6 text-[#046937]" />
        </div>

        <!-- Content -->
        <div class="flex-1">
          <div class="flex justify-between items-start mb-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ benefit.title }}
            </h3>
            <p class="text-green-600 font-medium whitespace-nowrap text-sm">
              {{ benefit.value }}
            </p>
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">
            {{ benefit.description }}
          </p>
          <span
            class="inline-block text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-0.5 rounded"
          >
            {{ benefit.included }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const benefits = [
  {
    title: "Free Business Education",
    icon: "mdi:school-outline",
    value: "Worth $2,000+",
    description:
      "Comprehensive courses covering business fundamentals, marketing, finance, and operations.",
    included: "Included with membership",
  },
  {
    title: "Professional Web Presence",
    icon: "mdi:web",
    value: "Worth $1,500+",
    description:
      "Free one-page website design and local directory listings to boost your online visibility.",
    included: "Included with membership",
  },
  {
    title: "Expert Business Consulting",
    icon: "mdi:account-tie",
    value: "Worth $500+",
    description:
      "One-on-one sessions with experienced business consultants to solve specific challenges.",
    included: "Included with membership",
  },
  {
    title: "Tax Preparation Services",
    icon: "mdi:cash-register",
    value: "Worth $800+",
    description:
      "Professional tax preparation and planning to maximize deductions and minimize liability.",
    included: "Included with membership",
  },
  {
    title: "Insurance Solutions",
    icon: "mdi:shield-check",
    value: "Save 15–30%",
    description:
      "Access to business and personal insurance options with member pricing.",
    included: "Included with membership",
  },
  {
    title: "Referral Network",
    icon: "mdi:account-multiple-plus",
    value: "Priceless",
    description:
      "Connect with other members for mutual referrals and business opportunities.",
    included: "Included with membership",
  },
];
</script>
