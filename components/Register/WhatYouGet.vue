<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  employeeSize: string;
  plans: { value: string; label: string }[];
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Registration Steps (unchanged) -->
    <!-- ... -->

    <!-- Pricing Tiers -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="flex flex-col space-y-1.5 p-6">
        <div class="text-2xl font-semibold leading-none tracking-tight flex items-center space-x-2">
          <NuxtIcon name="lucide-dollar-sign" class="h-5 w-5 text-[#046937]" />
          <span>Pricing Tiers</span>
        </div>
      </div>

      <div class="p-6 pt-0">
        <div class="space-y-3">
          <!-- Render all plans dynamically -->
          <div
            v-for="plan in plans"
            :key="plan.value"
            class="p-3 rounded-lg border-2 transition-colors"
            :class="employeeSize === plan.value ? 'border-[#046937] bg-green-50' : 'border-gray-200'"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ plan.label.split(' - ')[0] }}</span>
              <span class="text-[#046937] font-semibold">{{ plan.label.split(' - ')[1] }}</span>
            </div>
          </div>
        </div>

        <!-- Selected Plan -->
        <div
          v-if="employeeSize"
          class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
        >
          <h4 class="font-semibold text-[#046937] mb-2">Selected Plan:</h4>
          <p class="text-sm text-gray-700">
            {{ plans.find(p => p.value === employeeSize)?.label }}
          </p>
          <p class="text-xs text-white mt-1">
            Payment will be processed immediately after registration
          </p>
        </div>
      </div>
    </div>

   <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div class="flex flex-col space-y-1.5 p-6">
                <div class="text-2xl font-semibold leading-none tracking-tight">What You Get</div>
              </div>

              <div class="p-6 pt-0">
                <div class="space-y-3">

                  <!-- Benefits -->
                  <div class="flex items-center space-x-2">
                    <NuxtIcon name="lucide-circle-check-big" class="h-4 w-4 text-green-600" />
                    <span class="text-sm">Group Health Insurance</span>
                  </div>

                  <div class="flex items-center space-x-2">
                    <NuxtIcon name="lucide-circle-check-big" class="h-4 w-4 text-green-600" />
                    <span class="text-sm">Free Business Education</span>
                  </div>

                  <div class="flex items-center space-x-2">
                    <NuxtIcon name="lucide-circle-check-big" class="h-4 w-4 text-green-600" />
                    <span class="text-sm">Professional Networking</span>
                  </div>

                  <div class="flex items-center space-x-2">
                    <NuxtIcon name="lucide-circle-check-big" class="h-4 w-4 text-green-600" />
                    <span class="text-sm">Business Support Services</span>
                  </div>

                </div>
              </div>
            </div>
  </div>
</template>
