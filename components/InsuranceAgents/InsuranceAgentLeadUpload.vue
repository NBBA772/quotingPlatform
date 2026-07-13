<!-- components/InsuranceAgentLeadUpload.vue -->
<script setup lang="ts">
import { ref } from "vue";

const file = ref<File | null>(null);
const uploading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
  }
}

async function uploadLeads() {
  if (!file.value) {
    errorMessage.value = "Please select a CSV or Excel file.";
    return;
  }

  uploading.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const authToken = useCookie("auth_token").value;

    const formData = new FormData();
    formData.append("file", file.value);

    const res = await fetch("/api/leads/services/round-robin-upload/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload leads");

    const data = await res.json();
    successMessage.value = `✅ Successfully uploaded ${data.count} leads!`;
    file.value = null;
  } catch (err: any) {
    errorMessage.value = err.message || "Upload failed.";
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div
    class="bg-white dark:bg-[#3a4934] shadow-md rounded-xl p-6 transition-all duration-300"
  >
    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
      Upload Agent Leads
    </h2>

    <!-- File input -->
    <label
      for="leads-file"
      class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      Select a CSV or Excel file:
    </label>
    <input
      id="leads-file"
      type="file"
      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      class="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg 
             file:border-0 file:text-sm file:font-semibold 
             file:bg-blue-50 file:text-blue-700 
             hover:file:bg-blue-100 dark:file:bg-[#2d3a2c] dark:file:text-blue-400"
      @change="handleFileChange"
    />

    <!-- Upload button -->
    <div class="mt-4 flex justify-end">
      <button
        class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md disabled:opacity-50 transition-colors"
        :disabled="uploading || !file"
        @click="uploadLeads"
      >
        {{ uploading ? "Uploading..." : "Upload Leads" }}
      </button>
    </div>

    <!-- Status messages -->
    <p v-if="successMessage" class="text-green-600 mt-4 font-medium">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="text-red-600 mt-4 font-medium">
      {{ errorMessage }}
    </p>
  </div>
</template>
