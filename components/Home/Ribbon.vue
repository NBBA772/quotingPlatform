<template>
  <section
    class="w-full p-8 bg-green-800 text-gray-300 dark:text-gray-300 text-center"
  >
    <p class="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-white">
      Real Results for Real Businesses
    </p>
    <h3 class="mb-10 font-extrabold tracking-tight leading-snug text-white max-w-3xl mx-auto">
      Our members see measurable improvements in their business performance, from increased revenue to reduced operational costs.
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white dark:bg-[#142610] p-6 rounded-lg shadow"
      >
        <p class="text-4xl font-bold text-[#046937] dark:text-blue-400 mb-2">{{ stat.value }}</p>
        <p class="text-gray-700 dark:text-gray-300 text-lg">{{ stat.label }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "Ribbon",
};
</script>

<script setup>
const stats = [
  {
    value: '87%',
    label: 'Members report increased revenue within 6 months',
  },
  {
    value: '$3,200',
    label: 'Average annual savings per member',
  },
  {
    value: '500+',
    label: 'Successful business connections made',
  },
];
</script>
