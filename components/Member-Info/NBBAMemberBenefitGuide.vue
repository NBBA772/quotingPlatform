<template>
  <section class="w-full py-20 px-4 bg-green-50 dark:bg-green-900/30">
    <div class="max-w-4xl mx-auto bg-white dark:bg-[#142610] rounded-xl shadow-xl p-10 text-center">
      <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
        2025 NBBA Member Benefit Guide
      </h2>
      <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10">
        View our complete member benefits guide or download the PDF for offline viewing.
      </p>

      <!-- Toggle Switch -->
      <div class="flex justify-center mb-8">
        <label class="flex items-center cursor-pointer">
          <span class="mr-3 text-gray-700 dark:text-gray-300 font-medium">Download</span>
          <div class="relative">
            <input type="checkbox" v-model="showViewer" class="sr-only" />
            <div
              class="block w-14 h-8 rounded-full transition-colors"
              :class="showViewer ? 'bg-green-600 dark:bg-[#046937]' : 'bg-gray-400 dark:bg-[#3a4934]'"
            ></div>
            <div
              class="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"
              :class="showViewer ? 'translate-x-6' : ''"
            ></div>
          </div>
          <span class="ml-3 text-gray-700 dark:text-gray-300 font-medium">Viewer</span>
        </label>
      </div>

      <!-- Conditional Rendering -->
      <div v-if="!showViewer" class="flex flex-col sm:flex-row justify-center gap-6">
        <a
          href="/pdfs/2025-NBBA-Member-Benefit-Guide.pdf"
          target="_blank"
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#046937] hover:bg-[#035a2e] rounded-lg shadow-lg transition"
        >
          Open PDF in New Tab
        </a>
        <a
          href="/pdfs/2025-NBBA-Member-Benefit-Guide.pdf"
          download
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#046937] border-2 border-[#046937] hover:bg-[#046937] hover:text-white rounded-lg shadow-lg transition"
        >
          Download PDF
        </a>
      </div>

      <div v-else class="mt-6">
        <PDFviewer src="/pdfs/2025-NBBA-Member-Benefit-Guide.pdf" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";


const showViewer = ref(false);
</script>
