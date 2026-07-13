<script setup lang="ts">
import { ref, onMounted } from "vue";
import { registerWithEmail } from "~/composables/useAuth";
import { useRouter } from "vue-router";
import type { Ref } from "vue";

const router = useRouter();

// Form refs
const companyName = ref('');
const ein = ref('');
const salesmanCode = ref('');
const industry = ref('');
const streetAddress = ref('');
const city = ref('');
const state = ref('');
const zipCode = ref('');
const companyPhone = ref('');
const companyEmail = ref('');
const website = ref('');
const employeeSize = ref('');
const adminFirstName = ref('');
const adminLastName = ref('');
const adminUsername = ref('');
const adminEmail = ref('');
const adminPassword = ref('');
const adminPhoneNumber = ref('');
const selectedAgentId = ref<number | null>(null);

const errors: Ref<Map<string, { message: string }> | undefined> = ref(new Map());
const agents = ref<Array<{ id: number; firstName: string; lastName: string }>>([]);
const isLoading = ref(false);
let response: any;

const plans = [
  { value: "1", label: "Single Member - $99.99 Once & $24.99/month" },
  { value: "2-5", label: "2-5 Employees - $299.99 Once & $24.99/month" },
  { value: "6-10", label: "6-10 Employees - $599.99 Once & $24.99/month" },
  { value: "11+", label: "11+ Employees - $999.99 Once & $24.99/month" }
];

// Normalize phone number to 10-digit format
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it starts with 1 and has 11 digits, remove the 1
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.substring(1);
  }
  
  // Return the digits (should be 10 digits for valid US phone numbers)
  return digitsOnly;
}

// Fetch available agents
async function fetchAgents() {
  try {
    const data = await $fetch("/api/insurance-agent/list") as {
      agents: Array<{ id: number; firstName: string; lastName: string; isActive: boolean }>;
      agentIds: number[];
    };
    agents.value = data.agents || [];
  } catch (err) {
    console.error("Failed to fetch agents:", err);
  }
}

// Mark invite as accepted
async function markInviteAccepted(inviteId: number) {
  if (!inviteId) return console.warn("No invite ID provided");
  try {
    const updated = await $fetch("/api/leads/accept-invite", {
      method: "POST",
      body: { inviteId },
    });
    console.log("Invite updated:", updated);
    return updated;
  } catch (err) {
    console.error("Failed to mark invite accepted:", err);
    throw err;
  }
}

async function postRegisterForm() {
  let sessionId: number | string | undefined;
  let agentId: number | undefined;
  let inviteId: number | undefined;

  isLoading.value = true;

  try {
    // 1️⃣ Prepare registration payload
    const payload = {
      username: adminUsername.value,
      firstName: adminFirstName.value,
      lastName: adminLastName.value,
      phone: normalizePhoneNumber(adminPhoneNumber.value),
      email: adminEmail.value,
      password: adminPassword.value,
      companyName: companyName.value,
      ein: ein.value,
      salesmanCode: salesmanCode.value,
      industry: industry.value,
      streetAddress: streetAddress.value,
      city: city.value,
      state: state.value,
      zipCode: zipCode.value,
      companyPhone: normalizePhoneNumber(companyPhone.value),
      companyEmail: companyEmail.value,
      website: website.value,
      employeeSize: employeeSize.value
    };

    // 2️⃣ Register user & company
    response = await registerWithEmail(payload);
    if (response.hasErrors) {
      const map = new Map<string, { message: string }>();
      // Use .errors.data first, then .data, then .errors fallback
      const errorData = response.errors?.data ?? response.data ?? response.errors ?? {};
      for (const [key, msg] of Object.entries(errorData)) {
        if (typeof msg === 'object' && msg !== null && 'message' in msg) {
          map.set(key, { message: String(msg.message) });
        } else {
          map.set(key, { message: String(msg) });
        }
      }
      errors.value = map;
      console.error('Register validation errors:', errorData);
      isLoading.value = false;
      return;
    }

    sessionId = response?.session?.id || response?.user?.id;

    // 3️⃣ Add admin as employee
    try {
      const companyBusinessCode = response.company.businessCode;
      if (!companyBusinessCode) throw new Error("Company business code not found");

      await $fetch("/api/employee/register", {
        method: "POST",
        body: {
          businessCode: companyBusinessCode,
          firstName: adminFirstName.value,
          lastName: adminLastName.value,
          email: adminEmail.value,
          phone: normalizePhoneNumber(adminPhoneNumber.value),
          username: adminUsername.value,
          password: adminPassword.value
        },
      });
    } catch (err) {
      console.error('Registration failed (network or server error):', err);
      console.error("Failed to create admin as employee:", err);
    }

    // 4️⃣ Assign agent (either selected or round-robin)
    try {
      if (selectedAgentId.value) {
        // Use the selected agent
        agentId = selectedAgentId.value;
        console.log("Using selected agentId:", agentId);
        
        // Update the selected agent's lastAssignedAt timestamp
        await $fetch(`/api/insurance-agent/${agentId}/update-assignment`, {
          method: "POST"
        }).catch(err => {
          console.warn("Failed to update agent assignment timestamp:", err);
          // Continue anyway since the main assignment still works
        });
      } else {
        // Use round-robin assignment
        const agentData = await $fetch("/api/insurance-agent/round-robin") as {
          status: string;
          agent?: { id: number };
        };
        agentId = agentData?.agent?.id;
        console.log("Round-robin assigned agentId:", agentId);
      }
      
      if (!agentId) throw new Error("No agent available");
      
      // Save agentId to the company
      await $fetch("/api/company/update-agent", {
        method: "POST",
        body: {
          businessCode: response.company.businessCode,
          agentId
        }
      });
    } catch (err) {
      console.error("Failed to assign agent:", err);
      isLoading.value = false;
      return;
    }

// 5️⃣ Save lead invite for admin (no email, just DB)
try {
  const invitePayload = {
    email: adminEmail.value,
    agentId,
    leadId: null,
    acceptedAt: new Date(),
  };
  console.log("Creating lead invite with payload:", invitePayload);
  const inviteData = await $fetch("/api/leads/create-invite", {
    method: "POST",
    body: invitePayload,
  });
  console.log("Lead invite saved:", inviteData);
  inviteId = inviteData?.invite?.id;
} catch (err) {
  console.error("Failed to save lead invite:", err);
}


    // 6️⃣ Mark invite as accepted (optional redundancy)
    if (inviteId) {
      await markInviteAccepted(inviteId);
      console.log("Invite accepted:", inviteId);
    }

    // 7️⃣ Redirect to dashboard
    if (sessionId) router.push(`/dashboard/`);

  } catch (err) {
    console.error("Registration failed:", err);
  } finally {
    isLoading.value = false;
  }
}

// Fetch agents when component mounts
onMounted(() => {
  fetchAgents();
});
</script>





<template>
  <main class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center space-x-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#046937]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
          </svg>
          <h1 class="text-3xl font-bold text-gray-900">Business Registration</h1>
        </div>
        <p class="text-lg text-white max-w-2xl mx-auto">
          Join the National Business Benefit Alliance and unlock exclusive benefits for your business.
        </p>
      </div>

      <!-- Error Display -->
      <div
        v-if="response?.hasErrors && errors"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
        role="alert"
      >
        <ul>
          <li v-for="[key, value] in errors" :key="key">{{ value.message }}</li>
        </ul>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="postRegisterForm"  class="grid md:grid-cols-2 gap-8">
        <!-- Company Info -->
        <div class="rounded-lg border bg-white shadow-sm p-6 space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#046937]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
            </svg>
            <span>Company Information</span>
          </h2>

          <div class="space-y-4">
            <input
              v-model="companyName"
              required
              placeholder="Company Name *"
              class="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />

            <div class="grid grid-cols-3 gap-4">
              <input v-model="ein" placeholder="EIN# (Optional)" class="input w-full h-10 px-3 py-2" />
              <input v-model="salesmanCode" placeholder="Salesman Code (Optional)" class="input w-full h-10 px-3 py-2" />
              <input v-model="industry" required placeholder="Industry *" class="input w-full h-10 px-3 py-2" />
            </div>

            <h3 class="text-lg font-semibold text-gray-800">Business Address</h3>
            <input v-model="streetAddress" required placeholder="Street Address *" class="input w-full h-10 px-3 py-2" />

            <div class="grid grid-cols-2 gap-4">
              <input v-model="city" required placeholder="City *" class="input w-full h-10 px-3 py-2" />
              <input v-model="state" required placeholder="State *" class="input w-full h-10 px-3 py-2" />
            </div>

            <input v-model="zipCode" required placeholder="ZIP Code *" class="input w-full h-10 px-3 py-2" />
            <div class="grid grid-cols-2 gap-4">
              <input v-model="companyPhone" required placeholder="Phone Number *" class="input w-full h-10 px-3 py-2" />
              <input v-model="companyEmail" required type="email" placeholder="Company Email *" class="input w-full h-10 px-3 py-2" />
            </div>
            <input v-model="website" placeholder="Website" class="input w-full h-10 px-3 py-2" />
            <select v-model="employeeSize" required class="input w-full h-10 px-3 py-2">
              <option disabled value="">Select Employee Size *</option>
              <option value="1">Single Member - $99.99 Once & $24.99/month</option>
              <option value="2-5">2-5 Employees - $299.99 Once & $24.99/month</option>
              <option value="6-10">6-10 Employees - $599.99 Once & $24.99/month</option>
              <option value="11+">11+ Employees - $999.99 Once & $24.99/month</option>
            </select>
          </div>
                  <!-- Admin Info -->
                  <div class="rounded-lg border bg-white shadow-sm p-6 space-y-6">
                    <h2 class="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#046937]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>Company Administrator</span>
                    </h2>

                    <div class="grid grid-cols-2 gap-4">
                      <input v-model="adminFirstName" required placeholder="First Name *" class="input w-full h-10 px-3 py-2" />
                      <input v-model="adminLastName" required placeholder="Last Name *" class="input w-full h-10 px-3 py-2" />
                    </div>

                    <input v-model="adminUsername" required placeholder="Username *" class="input w-full h-10 px-3 py-2" />
                    <span v-if="errors?.get('username')" class="text-red-600 text-sm">
                      {{ errors.get('username')?.message }}
                    </span>
                    <input v-model="adminEmail" required type="email" placeholder="Email Address *" class="input w-full h-10 px-3 py-2" />
                    <span v-if="errors?.get('email')" class="text-red-600 text-sm">
                      {{ errors.get('email')?.message }}
                    </span>

                    <div class="grid grid-cols-2 gap-4">
                      <input v-model="adminPassword" type="password" required placeholder="Password *" class="input w-full h-10 px-3 py-2" />
                      <input v-model="adminPhoneNumber" required placeholder="Phone Number *" class="input w-full h-10 px-3 py-2" />
                    </div>
                    <span v-if="errors?.get('phone')" class="text-red-600 text-sm">
                      {{ errors.get('phone')?.message }}
                    </span>

                    <!-- Agent Selection -->
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Insurance Agent (Optional)</label>
                      <select v-model="selectedAgentId" class="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700">
                        <option :value="null">Auto-assign (Round Robin)</option>
                        <option 
                          v-for="agent in agents" 
                          :key="agent.id" 
                          :value="agent.id"
                        >
                          {{ agent.firstName }} {{ agent.lastName }}
                        </option>
                      </select>
                      <p class="text-xs text-gray-500">Leave as "Auto-assign" to automatically assign the next available agent</p>
                    </div>

                    <button 
                      type="submit" 
                      :disabled="isLoading"
                      class="w-full h-12 bg-[#046937] hover:bg-[#035a2e] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-md flex items-center justify-center"
                    >
                      <svg 
                        v-if="isLoading" 
                        class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          class="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          stroke-width="4"
                        ></circle>
                        <path 
                          class="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {{ isLoading ? 'Registering...' : 'Continue to Payment' }}
                    </button>

                    <p class="text-center text-sm text-white">
                      Already have an account?
                      <NuxtLink to="/login" class="text-[#046937] hover:underline font-medium">Sign in here</NuxtLink>
                    </p>
                  </div>
        </div>

        <WhatYouGet :employee-size="employeeSize" :plans="plans" />

      </form>
    </div>
  </main>
</template>
