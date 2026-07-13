<template>
  <div class="mx-auto pt-4 relative">
    <!-- Header & description -->
    <div v-if="!mock" class="mb-4">
      <h2 class="text-xl font-bold">Mass Invite Admins</h2>
      <p class="text-sm text-white dark:text-gray-400">
        App Admin sends out mass email invites for admins
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Cookies from "js-cookie";

const props = withDefaults(defineProps<{ mock?: boolean }>(), { mock: false });

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
      subject: "You're Invited to Join as an Insurance Agent",
      html: `
        <p>Hello,</p>
        <p>You’ve been invited to join our platform as an <b>insurance agent</b>.</p>
        <p>Please click the signup link in your real email when sent.</p>
      `,
    };
    message.value = `Previewing ${emails.length} emails (mock mode).`;
    emailsInput.value = "";
  } else {
    try {
      const authToken = Cookies.get("auth_token");
      if (!authToken) throw new Error("No auth token found");

      const response = await $fetch("/api/insurance-agent/send-mass-invite", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { emails },
      });

      if (response.success) {
        message.value = `Invites sent to ${emails.length} agents!`;
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
