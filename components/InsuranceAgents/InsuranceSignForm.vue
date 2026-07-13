<template>
  <div class="mx-auto p-6 bg-white dark:bg-[#3a4934] rounded-xl shadow-md space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Insurance Application</h2>

    <!-- Form -->
    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Group # -->
      <div>
        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Group #</label>
        <input type="text" v-model="form.groupNumber"
               class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
               required />
      </div>

      <!-- Group Name -->
      <div>
        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Name of Group</label>
        <input type="text" v-model="form.groupName"
               class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
               required />
      </div>

      <!-- Health Plan -->
      <div>
        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-1">Health Plan</label>
        <select v-model="form.healthPlan"
                class="w-full px-3 py-2 border rounded-md dark:bg-[#142610] dark:text-white"
                required>
          <option value="">Select Health Plan</option>
          <option value="plan1">Plan 1</option>
          <option value="plan2">Plan 2</option>
        </select>
      </div>

      <!-- Signature Pad -->
      <SignaturePad ref="signaturePad" class="border w-full h-40"/>

      <!-- Submit -->
      <button type="submit"
              class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]">
        Submit & Generate PDF
      </button>
    </form>

    <!-- Download Button -->
    <div v-if="pdfDownloadUrl" class="mt-4">
      <button @click="downloadPdf"
              class="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] dark:bg-[#046937] dark:hover:bg-[#058a45]">
        Download PDF
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useCookie } from "#imports";
import { PDFDocument } from 'pdf-lib'
import SignaturePad from 'vue3-signature-pad'

const signaturePad = ref<InstanceType<typeof SignaturePad>>(null)
const pdfDownloadUrl = ref<string | null>(null) // <-- store signed URL

const form = reactive({
  groupNumber: '',
  groupName: '',
  healthPlan: ''
})

function clearSignature() {
  signaturePad.value?.clear()
}

async function submitForm() {
  if (signaturePad.value?.isEmpty()) {
    alert('Please sign before submitting!');
    return;
  }

  const signatureDataUrl = signaturePad.value?.toDataURL();

  // 1️⃣ Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { height } = page.getSize();

  page.drawText(`Group #: ${form.groupNumber}`, { x: 50, y: height - 50, size: 14 });
  page.drawText(`Group Name: ${form.groupName}`, { x: 50, y: height - 80, size: 14 });
  page.drawText(`Health Plan: ${form.healthPlan}`, { x: 50, y: height - 110, size: 14 });

  const pngImageBytes = await fetch(signatureDataUrl!).then(res => res.arrayBuffer());
  const pngImage = await pdfDoc.embedPng(pngImageBytes);
  const pngDims = pngImage.scale(0.5);

  page.drawImage(pngImage, {
    x: 50,
    y: height - 200,
    width: pngDims.width,
    height: pngDims.height,
  });

  const pdfBytes = await pdfDoc.save();

  // 2️⃣ Upload PDF using FormData
  const formData = new FormData();
  formData.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }));
  formData.append('groupNumber', form.groupNumber);
  formData.append('groupName', form.groupName);
  formData.append('healthPlan', form.healthPlan);

  try {
    const authToken = useCookie('auth_token').value;

    const response = await fetch('/api/applications/upload-pdf', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    alert('PDF uploaded successfully!');
    console.log('API response:', data);

    // 3️⃣ Request a signed download URL
    const signedResponse = await fetch(`/api/applications/download/${data.application.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const signedData = await signedResponse.json();
    pdfDownloadUrl.value = signedData.url;

    function downloadPdf() {
      if (!pdfDownloadUrl.value) return;
      window.open(pdfDownloadUrl.value, "_blank");
    }

    pdfDownloadUrl.value = signedData.url;

  } catch (err) {
    console.error('Upload error:', err);
    alert('Failed to upload PDF. Check console.');
  }
}

function downloadPdf() {
  if (!pdfDownloadUrl.value) return;
  window.open(pdfDownloadUrl.value, "_blank"); // opens PDF in new tab
}
</script>
