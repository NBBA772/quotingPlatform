<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Cookies from "js-cookie";
import axios from "axios";

// Props
const props = withDefaults(
  defineProps<{
    userId: number | null;
    mock?: boolean;
  }>(),
  {
    userId: null,
    mock: false,
  }
);

const cards = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Mock demo data
const mockCards = [
  { id: 1, type: "Health", relation: "Self", imageUrl: "/images/medical.jpg" },
  { id: 2, type: "Dental", relation: "Spouse", imageUrl: "/images/dental.png" },
  { id: 3, type: "Vision", relation: "Child", imageUrl: "/images/vision.jpg" },
];

const fetchCards = async () => {
  if (props.mock) {
    cards.value = mockCards;
    return;
  }
  if (!props.userId) return;

  loading.value = true;
  error.value = null;

  try {
    const token = Cookies.get("auth_token");
    if (!token) throw new Error("Missing auth token");

    const response = await axios.get(`/api/user/${props.userId}/insurance-cards`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    cards.value = response.data.cards || [];
  } catch (err) {
    console.error("Error fetching insurance cards:", err);
    error.value = "Failed to load insurance cards.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCards);
watch(() => props.userId, fetchCards);

// --- Print as PDF ---
const printAsPDF = () => {
  if (process.server) return;
  const content = document.querySelector(".insurance-cards-display") as HTMLElement;
  if (!content) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`<html><head><title>Insurance Cards</title></head><body>${content.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.print();
};


</script>

<template>
  <div class="p-4 my-4 shadow rounded-lg bg-white dark:bg-[#3a4934]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-bold text-xl">Insurance Cards</h2>
      <button
        @click="printAsPDF"
        class="px-4 py-2 bg-blue-600 dark:bg-[#046937] text-white rounded hover:bg-[#046937] disabled:opacity-50"
      >
        Print as PDF
      </button>
    </div>

    <EmployeeInsuranceCardsSkeletonLoader v-if="loading && !props.mock" />

    <div v-else-if="error" class="p-4 text-center text-red-500">{{ error }}</div>

    <div v-else class="insurance-cards-display grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div
        v-for="card in cards"
        :key="card.id"
        class="card p-4 bg-white dark:bg-[#142610] shadow rounded-lg flex flex-col items-center"
      >
        <h3 class="font-bold text-lg mb-2">
          {{ card.type }} – {{ card.relation }}
        </h3>
        <img
          v-if="card.imageUrl"
          :src="card.imageUrl"
          :alt="`${card.type} (${card.relation}) Card`"
          class="w-full h-auto max-h-[500px] object-contain rounded shadow"
        />
        <div v-else class="text-gray-500">No card uploaded</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card img {
  object-fit: contain;
}
</style>
