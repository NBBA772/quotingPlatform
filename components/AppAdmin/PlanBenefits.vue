<template>
  <div>
    <!-- Show skeleton while loading -->
    <AppAdminPlanBenefitsSkeleton v-if="loading" />

    <!-- Show real form once loaded -->
    <div v-else class="plan-benefits p-4 my-4 shadow rounded-lg bg-white dark:bg-[#142610]">
      <div>
        <h2 class="font-bold text-lg mb-2">Plan Benefits</h2>

        <!-- Editable form -->
        <ul class="space-y-2 text-gray-800 dark:text-gray-200 border-b pb-4">
          <li
            v-for="(benefit, index) in localBenefits"
            :key="benefit.id || index"
            class="flex items-center gap-2"
          >
          <input
            v-model="benefit.name"
            placeholder="Benefit Name"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200"
          />

          <input
            v-model="benefit.description"
            placeholder="Description"
            class="border p-1 rounded bg-gray-100 dark:bg-[#3a4934] w-full
                  hover:bg-gray-200 dark:hover:bg-[#4a5d44]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-colors duration-200"
          />

            <button type="button" @click="removeBenefit(index)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm transition-all duration-200">Remove</button>
          </li>
        </ul>

        <div class="flex gap-3 mt-2">
          <button type="button" @click="addBenefit" class="px-4 py-2 bg-gray-200 dark:bg-[#3a4934] rounded hover:bg-gray-300 dark:hover:bg-[#1b3320] transition">
            Add Benefit
          </button>
          <button
            type="button"
            @click="saveBenefits"
            :disabled="loading || !props.userId"
            class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bg-[#058a45]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch } from "vue";


interface Props {
  userId: number | null;
}

interface Benefit {
  id?: number;
  name: string;
  description: string;
}

const props = defineProps<Props>();

const localBenefits = ref<Benefit[]>([]);
const planId = ref<number | null>(null);
const loading = ref(false);
const isAdmin = ref(false);

// fetch plan for selected user
const fetchPlan = async () => {
  if (!props.userId) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/plans/${props.userId}`);
    const data = await res.json();
    if (data.plans?.length > 0) {
      const plan = data.plans[0];
      planId.value = plan.id;
      localBenefits.value = plan.benefits || [];
    } else {
      localBenefits.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch plan", err);
  } finally {
    loading.value = false;
  }
};

const addBenefit = () => localBenefits.value.push({ name: "", description: "" });
const removeBenefit = (index: number) => localBenefits.value.splice(index, 1);

const saveBenefits = async () => {
  if (!props.userId) return;
  loading.value = true;
  try {
    const res = await fetch(`/api/plans/${props.userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planName: "Default Plan",
        planType: "Custom",
        benefits: localBenefits.value,
      }),
    });
    const data = await res.json();
    planId.value = data.plan.id;
    alert("Saved successfully");
  } catch (err) {
    console.error("Failed to save plan", err);
    alert("Failed to save benefits");
  } finally {
    loading.value = false;
  }
};

// fetch plan whenever the selected user changes
watch(() => props.userId, () => {
  if (props.userId) fetchPlan();
}, { immediate: true });

// example: isAdmin can still be derived from logged-in user if needed
// or you can pass isAdmin as a prop if needed
</script>
