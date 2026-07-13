<template>
  <div class="mx-auto pt-4 relative">
    <!-- Header & description -->
    <div v-if="!mock" class="mb-4">
      <h2 class="text-xl font-bold">Mass Invite Employees</h2>
      <p class="text-sm text-white dark:text-gray-400">
        Company admin sends out mass email invites
      </p>
    </div>

    <!-- Invite Form -->
    <div
      class="bg-white dark:bg-[#142610] shadow rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700"
    >
      <form @submit.prevent="sendInvites" class="flex flex-col space-y-3">
        <textarea
          v-model="emailsInput"
          rows="5"
          class="flex-1 border rounded-lg p-2 focus:ring focus:ring-blue-200 dark:bg-[#63725C] dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500"
          placeholder="Enter one email per line"
          required
        ></textarea>

        <button
          type="submit"
          class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          :disabled="loading"
        >
          {{ loading ? "Processing..." : "Send Mass Invites" }}
        </button>
      </form>

      <!-- Feedback -->
      <p v-if="message" class="mt-3 text-sm text-green-600 dark:text-green-400">{{ message }}</p>
      <p v-if="error" class="mt-3 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Mock Email Display -->
    <div
      v-if="props.mock && lastEmail"
      class="mt-4 p-4 bg-gray-100 dark:bg-[#142610] border border-gray-300 dark:border-gray-600 rounded"
    >
      <h3 class="font-bold mb-2">Mock Email Preview</h3>
      <p><strong>From:</strong> {{ lastEmail.from }}</p>
      <p><strong>To:</strong> {{ lastEmail.to }}</p>
      <p><strong>Subject:</strong> {{ lastEmail.subject }}</p>
      <p><strong>Body:</strong></p>
      <div
        class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded"
      >
        <div v-html="lastEmail.html"></div>
      </div>
    </div>

    <div v-if="props.mock">
      <!-- Props Table -->
      <div class="mt-8">
        <h2 class="text-lg font-bold mb-2">Props</h2>
        <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr class="bg-gray-100 dark:bg-[#142610]">
              <th class="border p-2 text-left">Name</th>
              <th class="border p-2 text-left">Type</th>
              <th class="border p-2 text-left">Default</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">mock</td>
              <td class="border p-2">boolean</td>
              <td class="border p-2">false</td>
              <td class="border p-2">
                If true, displays a mock email preview instead of sending real emails.
              </td>
            </tr>
            <tr>
              <td class="border p-2">companyName</td>
              <td class="border p-2">string</td>
              <td class="border p-2">"Example Corp"</td>
              <td class="border p-2">The company name to show in the invite email.</td>
            </tr>
            <tr>
              <td class="border p-2">businessCode</td>
              <td class="border p-2">string</td>
              <td class="border p-2">"ABC123"</td>
              <td class="border p-2">The business code to display in the invite email.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Functions Table -->
      <div class="mt-8">
        <h2 class="text-lg font-bold mb-2">Functions</h2>
        <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr class="bg-gray-100 dark:bg-[#142610]">
              <th class="border p-2 text-left">Name</th>
              <th class="border p-2 text-left">Parameters</th>
              <th class="border p-2 text-left">Returns</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-2">sendInvites</td>
              <td class="border p-2">None</td>
              <td class="border p-2">Promise&lt;void&gt;</td>
              <td class="border p-2">
                Sends mass invites to all emails entered in the textarea. If
                <code>mock</code> is true, it shows a preview instead of sending.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Cookies from "js-cookie";

// Props
const props = withDefaults(
  defineProps<{ mock?: boolean; companyName?: string; businessCode?: string }>(),
  { mock: false }
);

const emailsInput = ref("");
const loading = ref(false);
const message = ref("");
const error = ref("");

// Mock email object
interface EmailContent {
  from: string;
  to: string;
  subject: string;
  html: string;
}
const lastEmail = ref<EmailContent | null>(null);

// Company info
const company = {
  companyName: props.companyName || "Example Corp",
  businessCode: props.businessCode || "ABC123",
};

const sendInvites = async () => {
  loading.value = true;
  error.value = "";
  message.value = "";
  lastEmail.value = null;

  const emails = emailsInput.value
    .split("\n")
    .map(e => e.trim())
    .filter(e => e.length > 0);

  if (emails.length === 0) {
    error.value = "Please enter at least one email.";
    loading.value = false;
    return;
  }

  if (props.mock) {
    // Mock preview
    lastEmail.value = {
      from: "onboarding@resend.dev",
      to: emails.join(", "),
      subject: `Your Company Code for ${company.companyName}`,
      html: `
        <p>Hello,</p>
        <p>Here is your company code for <b>${company.companyName}</b>:</p>
        <h2>${company.businessCode}</h2>
      `,
    };
    message.value = `Previewing ${emails.length} emails (mock mode).`;
    emailsInput.value = "";
  } else {
    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) throw new Error("No auth token found");

      const response = await $fetch("/api/company/send-mass-invite", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { emails },
      });

      if (response.success) {
        message.value = `Invites sent to ${emails.length} employees!`;
        emailsInput.value = "";
      } else {
        error.value = "Failed to send invites.";
      }
    } catch (err: any) {
      console.error(err);
      error.value = err?.message || "Error sending invites.";
    }
  }

  loading.value = false;
};
</script>
