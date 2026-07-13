<template>
  <section class="max-w-7xl mx-auto text-center">
    <div class="h-[800px] border rounded-md overflow-hidden">
      <iframe
        :src="pdfUrl"
        class="w-full h-full"
        frameborder="0"
      ></iframe>
    </div>
  </section>
</template>

<script setup>
const pdfUrl = '/pdfs/2025-NBBA-Member-Benefit-Guide.pdf'
</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
}
</style>
