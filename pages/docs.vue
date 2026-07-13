<template>
  <div class="p-4 max-w-5xl mx-auto prose dark:prose-invert">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
      NBBA Documentation
    </h1>

    <!-- Main Toggle -->
    <div class="mb-6 flex gap-4">
      <button
        :class="activeTab === 'api' ? 'bg-blue-500 dark:bg-[#046937] text-white' : 'bg-gray-200 dark:bg-[#3a4934]  dark:text-gray-200'"
        class="px-4 py-2 rounded"
        @click="activeTab = 'api'"
      >
        API Docs
      </button>
      <button
        :class="activeTab === 'components' ? 'bg-blue-500 dark:bg-[#046937] text-white' : 'bg-gray-200 dark:bg-[#3a4934] dark:text-gray-200'"
        class="px-4 py-2 rounded"
        @click="activeTab = 'components'"
      >
        Component Docs
      </button>
    </div>

    <!-- API Docs -->
    <div v-show="activeTab === 'api'" id="swagger-ui"></div>

    <!-- Component Docs -->
    <div v-show="activeTab === 'components'">
      <h2 class="text-gray-900 dark:text-gray-100 sm:text-4xl mt-14 mb-2 px-4">
        Component Documentation
      </h2>
      <p class="mt-2 text-sm text-white dark:text-gray-300 py-4 px-4">
        Explore available components, their props, and usage examples to speed up your development.
      </p>


      <!-- Category Tabs -->
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          :class="activeCategory === cat ? 'bg-blue-500 dark:bg-[#046937] text-white' : 'bg-gray-200 dark:bg-[#3a4934] dark:text-gray-200'"
          class="px-3 py-1 rounded text-sm"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Component Sections -->
      <section
        v-for="component in filteredComponents"
        :key="component._path"
        class="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-[#3a4934] shadow-sm"
      >
        <h2 class="text-xl font-bold mt-0 mb-2">{{ component.title }}</h2>
        <p class="mb-4 text-gray-700 dark:text-gray-300">
          {{ component.description || "No description provided." }}
        </p>

        <!-- Demo -->
        <ClientOnly>
          <ActiveCompanyEmployeesDemo v-if="component.title === 'ActiveCompanyEmployees'" />
        </ClientOnly>

         <ClientOnly>
            <BusinessCodeCopyDemo v-if="component.title === 'BusinessCodeCopy'" />
        </ClientOnly>

         <ClientOnly>
            <ClaimsSupportDemo v-if="component.title === 'Claims Support'" />
        </ClientOnly>

       <ClientOnly>
            <ClaimsSupportDisplayDemo v-if="component.title === 'Claims Support Display'" />
        </ClientOnly>

       <ClientOnly>
            <InsuranceCardDisplayDemo v-if="component.title === 'Insurance Cards Display'" />
        </ClientOnly>

        <ClientOnly>
            <PlanBenefitDisplayDemo v-if="component.title === 'Plan Benefit Display'" />
        </ClientOnly>

        <ClientOnly>
            <ProviderNetworkDisplayDemo v-if="component.title === 'Provider Network Display'" />
        </ClientOnly>

        <ClientOnly>
            <CoverageSummaryDemo v-if="component.title === 'Coverage Summary'" />
        </ClientOnly>

        <ClientOnly>
            <CSVExportDemo v-if="component.title === 'CSV Export'" />
        </ClientOnly>

        <ClientOnly>
            <DeletedEmployeesDemo v-if="component.title === 'Deleted Employees'" />
        </ClientOnly>

        <ClientOnly>
            <InviteEmployeeDemo v-if="component.title === 'Invite Employee'" />
        </ClientOnly>

         <ClientOnly>
            <MassInviteEmployeesDemo v-if="component.title === 'Mass Invite Employees'" />
        </ClientOnly>

         <ClientOnly>
            <RegistrationStatsDemo v-if="component.title === 'Registration Stats'" />
        </ClientOnly>

      </section>
    </div>
  </div>
</template>

<script setup>
import SwaggerUI from "swagger-ui-dist/swagger-ui-es-bundle.js";
import "swagger-ui-dist/swagger-ui.css";
import { onMounted, ref, computed } from "vue";
import { useAsyncData } from "#app";


// Main tab state
const activeTab = ref("api");

// Sub-category state
const activeCategory = ref("Admin");

// Initialize Swagger UI only when API tab is active
onMounted(() => {
  if (activeTab.value === "api") {
    SwaggerUI({
      dom_id: "#swagger-ui",
      url: "/api/swagger.json",
    });
  }
});

// Fetch component docs from Nuxt Content
const { data: components } = await useAsyncData("componentsDoc", () =>
  queryContent("/components").find()
);

// Define categories (could also come from frontmatter tags in docs)
const categories = ['Admin', "Employees", "Company", "Plans", "UI"];

// Filtered components by category
const filteredComponents = computed(() =>
  (components.value || []).filter((c) =>
    (c.category || "Admin") === activeCategory.value
  )
);
</script>
