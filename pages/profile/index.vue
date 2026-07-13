<template>
  <PatternSection>
    <div>
      <CompanyProfileHeaderSkeletonLoader v-if="loading" />
      <CompanyProfileHeader 
        v-else
        :user="loggedInUser"
        role="App Admin"
        @file-change="handleFileChange"
      />

    </div>
  </PatternSection>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthCookie } from "~/composables/useAuth";
import { useAppAdmin } from "~/composables/useAppAdmin";
import { useCompanyAdmin } from "~/composables/useCompanyAdmin";

const loggedInUser = ref<any>(null);
const authCookie = useAuthCookie();

const isAppAdmin = ref(false);
const isCompanyAdmin = ref(false);
const loading = ref(true);

async function getLoggedInUser() {
  try {
    if (!authCookie.value) return null;

    const response = await $fetch("/api/user", {
      headers: { Authorization: `Bearer ${authCookie.value}` },
    });

    const user = response.user || response;

    if (user?.id) {
      isAppAdmin.value = await useAppAdmin(user.id);
      isCompanyAdmin.value = await useCompanyAdmin(user.id);
    }

    return user; // <--- Important!
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  } finally {
    loading.value = false;
  }
}




onMounted(async () => {
  loggedInUser.value = await getLoggedInUser()
})

async function handleFileChange(file: File) {
  if (!file) return alert("No file selected.");
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    await $fetch("/api/user/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${authCookie.value}` },
      body: formData,
    });

    // Fetch fresh user
    const freshUser = await getLoggedInUser();
    if (freshUser) {
      loggedInUser.value = { ...freshUser }; // <-- trigger reactivity

      const userState = useState("user");
      userState.value = { ...freshUser }; // <-- update navbar
    }

    alert("Profile image uploaded successfully.");
  } catch (err) {
    console.error(err);
    alert("Upload failed.");
  }
}

</script>
