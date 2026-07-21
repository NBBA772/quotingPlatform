<template>
  <PatternSection>
    <div>
      <div class="max-w-7xl mx-auto p-6 space-y-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Manager Dashboard</h1>
        <AgentAdminTeam />
        <ChangePassword />
      </div>
    </div>
  </PatternSection>
</template>

<script setup lang="ts">
// Pure agent-manager (upline) dashboard. Producing agents who are also uplines
// see the same team view via a "My Team" toggle on the agent dashboard.
</script>
