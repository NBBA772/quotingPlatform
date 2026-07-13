<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

interface Provider {
  id?: number;
  name: string;
  type: string;
  location: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Props {
  userId: number | null;
}

const props = defineProps<Props>();

const localProviders = ref<Provider[]>([]);
const loading = ref(false);

const fetchProviders = async () => {
  if (!props.userId) return;

  loading.value = true;
  try {
    const res = await fetch(`/api/providers/${props.userId}`);
    const data = await res.json();
    localProviders.value = data.providers || [];
    console.log("Loaded providers:", data.providers);
  } catch (err) {
    console.error("Failed to fetch providers", err);
  } finally {
    loading.value = false;
  }
};
const addProvider = () =>
  localProviders.value.push({
    name: "",
    type: "",
    location: "",
    specialty: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

const removeProvider = (index: number) => localProviders.value.splice(index, 1);

const saveProviders = async () => {
  if (!props.userId) {
    console.log("Cannot save: userId not set");
    return;
  }

  console.log("Save button pressed, userId:", props.userId);
  console.log("Providers to save:", localProviders.value);

  try {
    const res = await fetch(`/api/providers/${props.userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localProviders.value),
    });
    const data = await res.json();
    localProviders.value = data.providers;
    console.log("Providers saved:", data.providers);
    alert("Providers saved successfully");
  } catch (err) {
    console.error("Failed to save providers", err);
    alert("Failed to save providers");
  }
};

onMounted(fetchProviders);
watch(() => props.selectedEmployee?.id, fetchProviders);
</script>

<template>
  <div class="provider-network p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
    <h2 class="font-bold text-lg mb-4">Provider Network (Edit)</h2>

    <AppAdminProviderNetworkSkeletonLoader v-if="loading" />

    <ul v-else class="space-y-4">
      <li
        v-for="(provider, index) in localProviders"
        :key="provider.id || index"
        class="border-b pb-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <input v-model="provider.name" placeholder="Provider Name"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.type" placeholder="Type"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.location" placeholder="Location"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.specialty" placeholder="Specialty"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.phone" placeholder="Phone"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.email" placeholder="Email"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.address" placeholder="Address"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.city" placeholder="City"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.state" placeholder="State"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

          <input v-model="provider.zipCode" placeholder="Zip Code"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200" />

        </div>
        <button type="button" @click="removeProvider(index)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm transition-all duration-200 mt-2">
          Remove
        </button>
      </li>
    </ul>

    <div class="mt-4 flex gap-3">
      <button type="button" @click="addProvider" class="px-4 py-2 bg-gray-200 dark:bg-[#3a4934] rounded hover:bg-gray-300 dark:hover:bg-[#1b3320] transition">Add Provider</button>
      <button
        type="button"
        @click="saveProviders"
        :disabled="!props.userId"
        class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bg-[#058a45]"
      >
        Save
      </button>

    </div>


  </div>
</template>
