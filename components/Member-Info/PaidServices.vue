<template>
  <section class="max-w-8xl mx-auto px-6 py-12 text-center lg:px-8">
    <!-- Section header -->
    <div
      class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-transparent mb-4"
    >
      Paid Services
    </div>
    <p
      class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
    >
      Additional Services Available
    </p>
    <p class="text-base text-gray-500 dark:text-gray-400 mb-8">
      Discounted professional services to help grow your business
    </p>

    <!-- Card grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
      <div
        v-for="(service, index) in paidServices"
        :key="index"
        class="p-6 rounded-lg bg-white dark:bg-[#142610] shadow relative"
      >
        <!-- Icon and title -->
        <div class="flex items-start mb-4 pb-4 border-b">
          <div class="bg-blue-100 p-3 rounded-lg text-[#1D4ED8] mr-4">
            <Icon :name="service.icon" class="w-8 h-8" />
          </div>
          <div>
            <div class="flex flex-wrap gap-2 mb-2">
              <div
                class="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold"
              >
                DISCOUNTED
              </div>
              <span
                v-if="service.comingSoon"
                class="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2.5 py-0.5 text-xs font-semibold"
              >
                Coming Soon
              </span>
            </div>
            <div
              class="font-semibold tracking-tight text-xl text-gray-800 dark:text-white"
            >
              {{ service.title }}
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-500 dark:text-white mb-4">
          {{ service.description }}
        </p>

        <!-- Bulleted list -->
        <ul class="space-y-2">
          <li
            v-for="(item, i) in service.bullets"
            :key="i"
            class="flex items-start text-gray-500 dark:text-white"
          >
            <Icon name="lucide:star" class="w-4 h-4 mt-1 mr-2 text-[#046937]" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Icon } from '#components'

const paidServices = [
  {
    title: 'Discounted Payroll',
    icon: 'lucide:credit-card',
    description:
      'Cost-effective and efficient payroll solutions to streamline your financial management.',
    bullets: [
      'Time-saving efficiency',
      'Hassle-free financial management',
      'Streamlined payroll solutions',
      'Cost-effective pricing',
    ],
    comingSoon: true,
  },
  {
    title: 'Tax Preparation Services',
    icon: 'lucide:file-text',
    description:
      'Professional tax preparation services to ensure compliance and maximize your deductions.',
    bullets: [],
    comingSoon: true,
  },
  {
    title: 'Custom Web Development',
    icon: 'lucide:code',
    description:
      'Advanced web development services for businesses needing more than a basic website.',
    bullets: [
      'Professional website design',
      'Responsive mobile-friendly layouts',
      'Custom database integration',
      'Content management systems',
      'SEO optimization included',
      'Starting at $1999.99',
    ],
  },
  {
    title: 'Custom Logo and Branding',
    icon: 'lucide:pen-tool',
    description:
      'Professional logo design and branding services to establish your unique business identity.',
    bullets: [
      'Logo Only - $149.99',
      'Complete Package - $349.99',
      'Includes: Logo design',
      'Business card design',
      'Professional brochure design',
      'Brand style guidelines',
      'Multiple format files (PNG, JPG, SVG)',
    ],
  },
  {
    title: 'SEO Services',
    icon: 'lucide:search',
    description:
      'Search engine optimization services to improve your online visibility and rankings.',
    bullets: [
      'Basic SEO Package - $199/month',
      'Standard SEO Package - $499/month',
      'Premium SEO Package - $999/month',
      'Enterprise SEO Package - $1499/month',
      'Keyword research and optimization',
      'On-page and technical SEO',
      'Local search optimization',
      'Monthly performance reports',
    ],
  },
  {
    title: 'Insurance Services',
    icon: 'lucide:shield',
    description:
      'Comprehensive insurance solutions tailored to your business needs.',
    bullets: [
      'General liability insurance',
      'Professional liability coverage',
      'Property insurance',
      "Workers' compensation",
      'Commercial auto insurance',
      'Competitive rates and coverage',
      'Expert consultation included',
    ],
  },
]
</script>
