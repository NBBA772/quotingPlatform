<template>
  <div class="plan-details p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
    <h2 class="font-bold text-lg mb-2">
      Plan Details ({{ mock ? "Mock" : "Edit" }})
    </h2>

    <div v-if="loading && !mock">
      <AppAdminPlanDetailsSkeleton />
    </div>


    <ul v-else class="space-y-2">
      <li class="flex flex-col gap-2">
        <input v-model="localPlan.planName" placeholder="Plan Name" class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934]" />
        <input v-model="localPlan.planType" placeholder="Plan Type" class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934]" />
        <input v-model="localPlan.coverageStart" type="date" placeholder="Coverage Start" class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934]" />
        <input v-model="localPlan.coverageEnd" type="date" placeholder="Coverage End" class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934]" />
        <input v-model="localPlan.networkType" placeholder="Network Type" class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934]" />
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4 border-b">
<!-- Primary Care Required -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
    Primary Care Required
  </label>
  <div class="flex gap-2">
    <button
      type="button"
      :class="[
        localPlan.primaryCareRequired === true
          ? 'bg-green-600 dark:bg-[#046937] text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-[#3a4934] dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium'
      ]"
      @click="localPlan.primaryCareRequired = true"
    >
      Yes
    </button>
    <button
      type="button"
      :class="[
        localPlan.primaryCareRequired === false
          ? 'bg-red-600 text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-[#3a4934] dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium'
      ]"
      @click="localPlan.primaryCareRequired = false"
    >
      No
    </button>
  </div>
</div>



<!-- Referral Required -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
    Referral Required
  </label>
  <div class="flex gap-2">
    <button
      type="button"
      :class="[
        localPlan.referralRequired === true
          ? 'bg-green-600 dark:bg-[#046937] text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-[#3a4934] dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium'
      ]"
      @click="localPlan.referralRequired = true"
    >
      Yes
    </button>
    <button
      type="button"
      :class="[
        localPlan.referralRequired === false
          ? 'bg-red-600 text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-[#3a4934] dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium'
      ]"
      @click="localPlan.referralRequired = false"
    >
      No
    </button>
  </div>
</div>

<!-- Out of Network -->
<div>
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
    Out of Network Coverage
  </label>
  <div class="flex gap-2">
    <button
      type="button"
      :class="[
        localPlan.outOfNetwork === true
          ? 'bg-green-600 dark:bg-[#046937] text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-[#3a4934] dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium'
      ]"
      @click="localPlan.outOfNetwork = true"
    >
      Yes
    </button>
    <button
      type="button"
      :class="[
        localPlan.outOfNetwork === false
          ? 'bg-red-500 text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-[#3a4934] dark:hover:bg-red-600 dark:text-gray-300',
        'px-4 py-2 rounded-lg font-medium'
      ]"
      @click="localPlan.outOfNetwork = false"
    >
      No
    </button>
  </div>
</div>
</div>

      </li>
    </ul>

    <div class="mt-3">
      <button
        type="button"
        @click="savePlan"
        :disabled="!mock && !userId"
        class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bbg-[#046937]"
      >
        Save
      </button>
      <button type="button" v-if="mock" @click="resetMock" class="ml-2 px-3 py-1 bg-gray-200 dark:bg-[#3a4934] rounded">Reset Mock</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

interface Plan {
  planName: string;
  planType: string;
  coverageStart: string;
  coverageEnd: string;
  networkType: string;
  primaryCareRequired: boolean;
  referralRequired: boolean;
  outOfNetwork: boolean;
}

const props = withDefaults(
  defineProps<{
    userId: number | null;
    mock?: boolean;
  }>(),
  {
    userId: null,
    mock: false
  }
);

const localPlan = ref<Plan>({
  planName: "",
  planType: "",
  coverageStart: "",
  coverageEnd: "",
  networkType: "",
  primaryCareRequired: false,
  referralRequired: false,
  outOfNetwork: false
});

const loading = ref(false);
const userId = ref(props.userId);

// Optional: default mock plan
const defaultMockPlan: Plan = {
  planName: "Sample PPO Plan",
  planType: "PPO",
  coverageStart: "2025-01-01",
  coverageEnd: "2025-12-31",
  networkType: "In-Network",
  primaryCareRequired: true,
  referralRequired: false,
  outOfNetwork: false
};

const fetchPlan = async () => {
  if (props.mock) {
    localPlan.value = { ...defaultMockPlan };
    return;
  }

  if (!userId.value) return;
  loading.value = true;

  try {
    const res = await $fetch(`/api/plan-details/${userId.value}`);
    localPlan.value = res.plan || localPlan.value;
  } catch (err) {
    console.error("Failed to fetch plan", err);
  } finally {
    loading.value = false;
  }
};

const savePlan = async () => {
  if (props.mock) {
    console.log("Mock save:", localPlan.value);
    alert("✅ Mock: Plan saved successfully");
    return;
  }

  if (!userId.value) return;

  try {
    const res = await fetch(`/api/plan-details/${userId.value}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localPlan.value)
    });
    const data = await res.json();
    if (data?.plan) {
      localPlan.value = data.plan;
      alert("✅ Plan saved successfully");
    } else {
      alert("❌ Failed to save plan");
    }
  } catch (err) {
    console.error("Failed to save plan", err);
    alert("❌ Failed to save plan");
  }
};

const resetMock = () => {
  localPlan.value = { ...defaultMockPlan };
};

onMounted(fetchPlan);
watch(() => props.userId, val => { userId.value = val; fetchPlan(); });
</script>
