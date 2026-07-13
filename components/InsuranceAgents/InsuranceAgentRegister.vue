<template>
  <div class="max-w-lg mx-auto p-6 bg-white dark:bg-[#142610] shadow rounded-lg">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
      Insurance Agent Registration
    </h2>

    <form @submit.prevent="registerAgent" class="space-y-4">
      <!-- First Name -->
      <input
        v-model="form.firstName"
        type="text"
        placeholder="First Name"
        required
        class="border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934] focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
      />

      <!-- Last Name -->
      <input
        v-model="form.lastName"
        type="text"
        placeholder="Last Name"
        required
        class="border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934] focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
      />

      <!-- Email -->
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        required
        class="border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934] focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
      />

      <!-- Phone -->
      <input
        v-model="form.phone"
        type="text"
        placeholder="Phone"
        class="border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934] focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
      />

      <!-- Username -->
      <input
        v-model="form.username"
        type="text"
        placeholder="Username"
        required
        class="border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934] focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
      />

      <!-- Password -->
      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        required
        class="border p-2 rounded w-full bg-gray-100 dark:bg-[#3a4934] focus:ring-2 focus:ring-blue-500 hover:border-blue-400"
      />

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold disabled:opacity-50"
      >
        {{ loading ? "Registering..." : "Register" }}
      </button>
    </form>

    <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
    <p v-if="success" class="mt-4 text-green-600">Agent registered successfully!</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useFetch } from "#app";

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  username: "",
  password: "",
});

const loading = ref(false);
const error = ref("");
const success = ref(false);

const registerAgent = async () => {
  loading.value = true;
  error.value = "";
  success.value = false;

  try {
    const { data, error: fetchError } = await useFetch("/api/insurance-agent/register", {
      method: "POST",
      body: form.value,
    });

    if (fetchError.value) throw new Error(fetchError.value.message);

    success.value = true;
    form.value = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    };
  } catch (err) {
    error.value = err.message || "Something went wrong.";
  } finally {
    loading.value = false;
  }
};
</script>
