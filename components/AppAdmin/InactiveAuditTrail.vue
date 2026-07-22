<template>
  <div class="mx-auto px-6 pb-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <!-- <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Processed</h2> -->

    <div v-if="loading" class="text-gray-500 dark:text-gray-300">Loading applications...</div>
    <div v-else-if="error" class="text-red-600 dark:text-red-400">{{ error }}</div>
    <div v-else-if="auditTrails.length === 0" class="text-gray-500 dark:text-gray-300">
      No processed applications yet.
    </div>

    <div v-else>
    <table class="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <thead class="bg-gray-100 dark:bg-[#142610]">
        <tr>
          <th class="p-3 border-b dark:border-gray-700">Signer</th>
          <th class="p-3 border-b dark:border-gray-700">Email</th>
          <th class="p-3 border-b dark:border-gray-700">Action</th>
          <th class="p-3 border-b dark:border-gray-700">IP</th>
          <th class="p-3 border-b dark:border-gray-700">Timestamp</th>
          <th class="p-3 border-b dark:border-gray-700">User</th>
          <th class="p-3 border-b dark:border-gray-700">PDF</th>
          <th class="p-3 border-b dark:border-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trail in pagedTrails" :key="trail.id" class="hover:bg-gray-50 dark:hover:bg-[#2d3a2a]">
          <td class="p-2 dark:text-white">{{ trail.signer }}</td>
          <td class="p-2 dark:text-white">{{ trail.email }}</td>
          <td class="p-2 dark:text-white">{{ trail.action }}</td>
          <td class="p-2 dark:text-white">{{ trail.ip }}</td>
          <td class="p-2 dark:text-white">{{ new Date(trail.timestamp).toLocaleString() }}</td>
          <td class="p-2 dark:text-white">{{ trail.user ? `${trail.user.firstName} ${trail.user.lastName}` : "N/A" }}</td>
          <td class="p-2 dark:text-white">
            <a v-if="trail.insuranceApplication?.pdfUrl" :href="trail.insuranceApplication.pdfUrl" target="_blank" class="text-blue-500 hover:underline">
              View PDF
            </a>
            <span v-else>N/A</span>
          </td>
          <td class="p-2">
            <div class="flex items-center gap-2">
              <button class="text-green-600 hover:text-green-800" @click="confirmRestore(trail.id)" title="Restore Application">
                <Icon name="mdi:restore" size="20" />
              </button>
              <button class="text-red-600 hover:text-red-800" @click="permanentDelete(trail.id)" title="Delete permanently">
                <Icon name="mdi:delete-forever" size="22" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <PaginationBar :total="auditTrails.length" :page="page" :page-size="pageSize" @update:page="page = $event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

interface AuditTrail {
  id: number;
  signer: string;
  email: string;
  ip: string;
  action: string;
  timestamp: string;
  user?: { firstName: string; lastName: string };
  insuranceApplication?: { pdfUrl?: string };
}

const auditTrails = ref<AuditTrail[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const page = ref(1);
const pageSize = 10;
const pagedTrails = computed(() =>
  auditTrails.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
watch(() => auditTrails.value.length, (len) => {
  const maxPage = Math.max(1, Math.ceil(len / pageSize));
  if (page.value > maxPage) page.value = maxPage;
});

onMounted(async () => {
  try {
    const res = await $fetch("/api/admin/audit-trails/deleted"); // only deleted (deletedAt != null)
    if (res.success) auditTrails.value = res.data;
    else error.value = res.error || "Failed to load audit trails";
  } catch (err: any) {
    error.value = err.message || "Failed to fetch audit trails";
  } finally {
    loading.value = false;
  }
});

const confirmRestore = async (id: number) => {
  if (!confirm("Restore this record?")) return;
  try {
    await $fetch(`/api/admin/audit-trails/${id}/restore`, { method: "PATCH" });
    auditTrails.value = auditTrails.value.filter(a => a.id !== id);
  } catch (err) {
    console.error("Error restoring:", err);
    alert("Failed to restore record");
  }
};

const permanentDelete = async (id: number) => {
  if (!confirm("PERMANENTLY delete this enrollment request? This cannot be undone.")) return;
  try {
    await $fetch(`/api/admin/audit-trails/${id}/permanent`, { method: "DELETE" });
    auditTrails.value = auditTrails.value.filter(a => a.id !== id);
  } catch (err: any) {
    console.error("Error permanently deleting:", err);
    alert(err?.data?.statusMessage || "Failed to permanently delete record");
  }
};
</script>
