<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
await navigateTo(`/enroll/${route.params.userId}/applicant`, { replace: true })
</script>

<template>
  <div />
</template>
