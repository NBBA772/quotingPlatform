<template>
    <section
        class="w-full p-8 dark:bg-[#3a4934] text-center text-gray-300"
    >
        <!-- Toggle Switch -->
        <div class="flex justify-center">
        <label class="flex items-center cursor-pointer">
            <!-- Label -->
            <span class="mr-3 text-gray-700 dark:text-gray-300 font-medium">
            Free
            </span>

            <!-- Switch -->
            <div class="relative">
            <input
                type="checkbox"
                v-model="showPaid"
                class="sr-only"
            />
            <div
                class="block w-14 h-8 rounded-full transition-colors"
                :class="showPaid ? 'bg-green-600 dark:bg-[#046937]' : 'bg-gray-400 dark:bg-[#142610]'"
            ></div>
            <div
                class="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"
                :class="showPaid ? 'translate-x-6' : ''"
            ></div>
            </div>

            <!-- Label -->
            <span class="ml-3 text-gray-700 dark:text-gray-300 font-medium">
            Paid
            </span>
        </label>
        </div>
        <!-- Conditional Render -->
        <FreeServices v-if="!showPaid" />
        <PaidServices v-else />
    </section>
</template>

<script setup>
import { ref } from "vue";

const showPaid = ref(false);
</script>