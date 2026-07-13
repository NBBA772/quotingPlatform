<template>
  <div class="mx-auto pt-4 relative">
    <!-- Invite Form -->
    <div
      class="bg-white dark:bg-[#142610] shadow rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700"
    >
      <form @submit.prevent="sendInvite" class="flex space-x-3">
        <input
          v-model="email"
          type="email"
          class="flex-1 border rounded-lg p-2 focus:ring focus:ring-blue-200 dark:bg-[#63725C] dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500"
          placeholder="Enter agent email"
          required
        />
        <button
          type="submit"
          class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          :disabled="loading"
        >
          {{ loading ? "Processing..." : "Send Invite" }}
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
                If true, displays a mock email preview instead of sending a real email.
              </td>
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
              <td class="border p-2">sendInvite</td>
              <td class="border p-2">None</td>
              <td class="border p-2">Promise&lt;void&gt;</td>
              <td class="border p-2">
                Sends an invite email to an insurance agent. If <code>mock</code> is true, it renders a preview instead of
                sending.
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
  defineProps<{ mock?: boolean }>(),
  { mock: false }
);

const email = ref("");
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

const sendInvite = async () => {
  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    if (props.mock) {
      lastEmail.value = {
        from: "onboarding@resend.dev",
        to: email.value,
        subject: "You're Invited to Join as an Insurance Agent",
        html: `
          <p>Hello,</p>
          <p>You’ve been invited to join our platform as an insurance agent.</p>
          <p>Please click the link below to create your account:</p>
          <a href="https://yourapp.com/agent/signup?email=${encodeURIComponent(email.value)}">Create Account</a>
        `,
      };
      message.value = `Mock email prepared for ${email.value}`;
      email.value = "";
    } else {
      const authToken = Cookies.get("auth_token");
      if (!authToken) throw new Error("No auth token found");

      const response = await $fetch("/api/insurance-agent/send-invite", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { email: email.value },
      });

      if (response.success) {
        message.value = `Invite sent successfully to ${email.value}!`;
        email.value = "";
      } else {
        error.value = "Failed to send invite.";
      }
    }
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || "Error sending invite.";
  } finally {
    loading.value = false;
  }
};
</script>
