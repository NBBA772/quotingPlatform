<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { nanoid } from "nanoid";

interface InsuranceCard {
  id?: number;
  relation: string; // Self, Spouse, Child, Other
  type: string;     // Health, Dental, Vision
  imageUrl?: string;
  file?: File | null;
}

interface Member {
  id: string;
  relation: string;
  cards: InsuranceCard[];
}

interface Props {
  userId: number | null;
  selectedCompanyId: number | null; // Pass selected company ID as prop
}
const props = defineProps<Props>();

const members = ref<Member[]>([]);
const uploading = ref(false);
const loading = ref(true);

// Watch for changes in both userId and selectedCompanyId
watch([() => props.userId, () => props.selectedCompanyId], async ([newUserId, newCompanyId], [oldUserId, oldCompanyId]) => {
  members.value = []; // Clear old members/cards immediately
  if (newUserId && newCompanyId) {
    await fetchCards(newCompanyId);
  }
}, { immediate: false });

// Fetch existing insurance cards for a company
const fetchCards = async (companyId: number) => {
  if (!props.userId) return;

  loading.value = true;
  try {
    const { data } = await axios.get(`/api/user/${props.userId}/insurance-cards?companyId=${companyId}`);

    const membersArr: Member[] = [];
    const relationCounters: Record<string, number> = {};
    const tempChildren: Record<string, InsuranceCard[]> = {};

    for (const card of data.cards || []) {
      const rel = card.relation;

      if (rel === "Child") {
        tempChildren[rel] = tempChildren[rel] || [];
        tempChildren[rel].push({ ...card, file: null, imageUrl: card.imageUrl || null });

        if (tempChildren[rel].length === 3) {
          relationCounters[rel] = (relationCounters[rel] || 0) + 1;
          membersArr.push({
            id: `${rel}-${relationCounters[rel]}`,
            relation: rel,
            cards: tempChildren[rel],
          });
          tempChildren[rel] = [];
        }
      } else {
        let member = membersArr.find(m => m.relation === rel);
        if (!member) {
          member = {
            id: `${rel}-1`,
            relation: rel,
            cards: [
              { type: "Health", relation: rel, file: null },
              { type: "Dental", relation: rel, file: null },
              { type: "Vision", relation: rel, file: null },
            ],
          };
          membersArr.push(member);
        }
        const cardIndex = member.cards.findIndex(c => c.type === card.type);
        if (cardIndex >= 0) {
          member.cards[cardIndex] = { ...card, file: null, imageUrl: card.imageUrl || null };
        }
      }
    }

    members.value = membersArr;
  } catch (err) {
    console.error("Failed to fetch insurance cards", err);
  } finally {
    loading.value = false;
  }
};


// Add a new member, default relation is "Self"
const addMember = () => {
  const defaultRelation = "Child";
  members.value.push({
    id: nanoid(),
    relation: defaultRelation,
    cards: [
      { relation: defaultRelation, type: "Health", file: null },
      { relation: defaultRelation, type: "Dental", file: null },
      { relation: defaultRelation, type: "Vision", file: null },
    ],
  });
};


// Remove a member
const removeMember = async (memberIndex: number) => {
  const member = members.value[memberIndex];
  if (!props.userId) return;
  const confirmDelete = confirm(`Are you sure you want to remove ${member.relation}?`);
  if (!confirmDelete) return;

  try {
    for (const card of member.cards) {
      if (card.id) {
        await axios.delete(`/api/user/${props.userId}/insurance-card/${card.id}`);
      }
    }
    members.value.splice(memberIndex, 1);
  } catch (err) {
    console.error("Failed to remove member", err);
    alert("Failed to remove member. Try again.");
  }
};

// Handle file upload
const handleFileChange = (event: Event, memberIndex: number, cardIndex: number) => {
  const input = event.target as HTMLInputElement;
  if (input?.files?.[0]) {
    const card = members.value[memberIndex].cards[cardIndex];
    card.file = input.files[0];
    card.imageUrl = URL.createObjectURL(input.files[0]);
  }
};

// Save all cards
const saveCards = async () => {
  if (!props.userId) return;
  uploading.value = true;
  try {
    for (const member of members.value) {
      for (const card of member.cards) {
        if (card.file) {
          const formData = new FormData();
          formData.append("insuranceCard", card.file);
          formData.append("relation", member.relation);
          formData.append("type", card.type);
          await axios.post(`/api/user/${props.userId}/upload-insurance-card`, formData);
        }
      }
    }
    alert("Insurance cards saved successfully!");
    if (props.selectedCompanyId) fetchCards(props.selectedCompanyId);
  } catch (err) {
    console.error(err);
    alert("Failed to save insurance cards.");
  } finally {
    uploading.value = false;
  }
};

// Fetch cards on mount if both userId and company are already selected
onMounted(() => {
  if (props.userId && props.selectedCompanyId) {
    fetchCards(props.selectedCompanyId);
  }
});
</script>


<template>
  <div class="space-y-6">
    <div class="p-4 shadow rounded-lg bg-white dark:bg-[#142610]">

      <!-- Skeleton Loader -->
      <AppAdminInsuranceCardsSkeleton v-if="loading" />

      <!-- Members with Animation -->
      <transition-group name="fade-slide" tag="div" class="space-y-4" v-else>
        <div
          v-for="(member, mIndex) in members"
          :key="member.id"
          class="p-4 rounded-lg bg-gray-50 dark:bg-[#1b3320] shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-200">
              {{ member.relation }} Member
              {{ members.filter(m => m.relation === member.relation).indexOf(member) + 1 }}
            </h3>
            <button
              @click="removeMember(mIndex)"
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm transition-all duration-200"
            >
              Remove
            </button>
          </div>
          
          <!-- Relation Selector -->
          <div class="relative inline-block mb-4">
            <select
              v-model="member.relation"
              class="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-[#142610]
                    px-3 py-2 pr-10 text-gray-800 dark:text-gray-200 shadow-sm
                    hover:bg-gray-200 dark:hover:bg-[#1b3320] hover:border-green-500
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="Self">Self</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Other">Other</option>
            </select>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
              ▼
            </span>
          </div>



          <!-- Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="(card, cIndex) in member.cards"
              :key="cIndex"
              class="card p-4 shadow rounded-lg bg-gray-50 dark:bg-[#1f2e1f] flex flex-col items-center"
            >
              <h3 class="font-bold text-lg mb-2">{{ card.type }} Card</h3>

              <input
                type="file"
                accept="image/*"
                @change="handleFileChange($event, mIndex, cIndex)"
                :id="'file-input-' + member.id + '-' + cIndex"
                class="hidden"
              />

              <label
                :for="'file-input-' + member.id + '-' + cIndex"
                class="flex items-center justify-center w-full h-48 mt-2 border-2 border-dashed rounded-lg cursor-pointer 
                       bg-gray-200 dark:bg-[#3a4934] hover:border-blue-500 overflow-hidden"
              >
                <template v-if="card.imageUrl">
                  <img :src="card.imageUrl" alt="Insurance Card" class="w-full h-full object-contain" />
                </template>
                <template v-else>
                  <span class="text-gray-500 text-center">Click to upload</span>
                </template>
              </label>

              <span v-if="card.file && !card.imageUrl" class="text-gray-500 text-sm mt-1">{{ card.file.name }}</span>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Actions -->
      <div class="flex gap-3 mt-4" v-if="!loading">
        <button
          type="button"
          @click="addMember"
          class="px-4 py-2 bg-gray-200 dark:bg-[#3a4934] rounded hover:bg-gray-300 dark:hover:bg-[#1b3320] transition"
        >
          Add Family Member
        </button>
        <button
          type="button"
          @click="saveCards"
          :disabled="uploading"
          class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-[#046937] disabled:opacity-50 dark:bg-[#046937] dark:hover:bg-[#058a45]"
        >
          {{ uploading ? "Saving..." : "Save All" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Simple fade-slide animation */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
