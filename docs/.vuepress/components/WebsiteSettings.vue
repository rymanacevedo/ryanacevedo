<template>
  <div class="absolute right-0 ma4">
    <div
      id="settingsContainer"
      class="
        settings
        flex flex-column
        br2
        ba
        dark-gray
        b--black-10
        bg-
        mv3
        pa5
        grow
      "
    >
      <ToggleDarkMode />
      <button>Toggle all cookies</button>
    </div>
    <button @click="toggleSettings" id="settingsBtn" class="fixed right-0 bottom-0 ma2 outline z-max">
      <svg
        v-if="isToggled"
        width="24"
        height="24"
        xmlns="http://www.w3.org/2000/svg"
        fill-rule="evenodd"
        clip-rule="evenodd"
      >
        <path
          d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z"
        />
      </svg>
      <svg
        v-if="!isToggled"
        width="24"
        height="24"
        xmlns="http://www.w3.org/2000/svg"
        fill-rule="evenodd"
        clip-rule="evenodd"
      >
        <path
          d="M23.245 20l-11.245-14.374-11.219 14.374-.781-.619 12-15.381 12 15.391-.755.609z"
        />
      </svg>
    </button>
  </div>
</template>

<script>
import ToggleDarkMode from "./ToggleDarkMode";
export default {
  data() {
    return {
      isToggled: false,
    };
  },
  components: {
    ToggleDarkMode,
  },
  methods: {
    toggleSettings() {
      const settingsBtn = document.getElementById("settingsBtn");
      const settingsContainer = document.getElementById("settingsContainer");

      settingsBtn.classList.toggle("toggled");
      settingsContainer.classList.toggle("open");
      this.isToggled = !this.isToggled;
    },
  },
};
</script>

<style>
.settings {
  display: none;
}

.settings.open {
  display: block;
}
</style>