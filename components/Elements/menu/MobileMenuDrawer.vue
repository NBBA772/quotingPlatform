<script setup lang="ts">
const props = defineProps<{ showSideDrawer: boolean }>()
const emit = defineEmits<{ (e: 'closeDrawer'): void }>()

function emitCloseEvent() {
  emit('closeDrawer')
}
</script>
<template>
  <Teleport to="body">
    <!-- backdrop -->
    <Transition name="fade">
      <div
        v-if="props.showSideDrawer"
        class="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
        @click="emitCloseEvent"
      ></div>
    </Transition>

    <!-- drawer -->
    <div
      id="drawer-navigation"
      class="fixed z-50 top-0 left-0 h-screen w-72 max-w-[85vw] p-4 overflow-y-auto bg-white dark:bg-black shadow-xl transition-transform duration-300 md:hidden"
      :class="props.showSideDrawer ? 'translate-x-0' : '-translate-x-full'"
      tabindex="-1"
      aria-labelledby="drawer-navigation-label"
    >
      <h5
        id="drawer-navigation-label"
        class="text-base font-semibold text-gray-500 dark:text-gray-200 uppercase"
      >
        Menu
      </h5>

      <button
        @click="emitCloseEvent"
        type="button"
        aria-controls="drawer-navigation"
        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-500 dark:text-gray-200 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <svg
          aria-hidden="true"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span class="sr-only">Close menu</span>
      </button>

      <MobileMenuList />
    </div>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
