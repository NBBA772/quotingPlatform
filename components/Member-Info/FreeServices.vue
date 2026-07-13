<template>
  <section class="max-w-8xl mx-auto px-6 py-12 text-center lg:px-8">
    <!-- Section header -->
    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-transparent mb-4">
      Free Services
    </div>
    <p class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
      Included at No Extra Cost
    </p>
    <p class="text-base text-gray-500 dark:text-gray-400">
      Every NBBA member receives these valuable services as part of their membership
    </p>

    <!-- Card grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
      <div
        v-for="(service, index) in services"
        :key="index"
        class="p-6 rounded-lg bg-white dark:bg-[#142610] shadow relative"
      >
        <!-- Icon and title -->
        <div class="flex items-start mb-4 pb-4 border-b">
          <div class="bg-green-100 p-3 rounded-lg text-[#046937] mr-4">
            <Icon :name="service.icon" class="w-8 h-8" />
          </div>
          <div>
            <div class="flex flex-wrap gap-2 mb-2">
              <div class="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-semibold">
                FREE
              </div>
              <span
                v-if="service.underConstruction"
                class="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-2.5 py-0.5 text-xs font-semibold"
              >
                Under Construction
              </span>
            </div>
            <div class="font-semibold tracking-tight text-xl text-gray-800 dark:text-white">
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

const services = [
  {
    title: 'Free Business Education',
    icon: 'lucide:graduation-cap',
    description:
      'Access to our virtual library of business education resources with courses on vital subjects from payroll to marketing. Earn certificates of completion.',
    bullets: [
      'Virtual library of business education resources',
      'Courses on payroll, marketing, and more',
      'Certificate of completion',
      'Step-by-step guidance materials',
    ],
  },
  {
    title: 'Free Consulting',
    icon: 'lucide:user-check',
    description:
      'Dedicated consultant committed to helping your small business thrive with personalized guidance and support.',
    bullets: [
      'Assigned personal consultant',
      'Customized business plan development',
      'Unique marketing strategies',
      'Essential business skills cultivation',
    ],
  },
  {
    title: 'Free Website',
    icon: 'lucide:globe',
    description:
      'Professional one-page website customized to your business\'s look and feel to establish your online presence.',
    bullets: [
      'Basic one-page website',
      'Customized to your business',
      'Professional web developers',
      'Platform to showcase products/services',
    ],
  },
  {
    title: 'Free Local Listing',
    icon: 'lucide:map-pin',
    description:
      'Improve your visibility in local search results with our online business directory listing and backlink.',
    bullets: [
      'Free listing in local directory',
      'Backlink to your business',
      'NBBA endorsement',
      'Targeted local traffic',
    ],
    underConstruction: true,
  },
  {
    title: 'Free Referral Network',
    icon: 'lucide:users',
    description:
      'Connect with like-minded businesses and earn $50 commissions for successful referrals within our network.',
    bullets: [
      'Exclusive referral system',
      '$50 commission per successful referral',
      'Red Hot Leads exclusively for you',
      'Network of trusted local businesses',
    ],
    underConstruction: true,
  },
]
</script>
