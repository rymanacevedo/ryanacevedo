<template>
  <div>
    <button @click="toggleSettings" id="settingsBtn" class="absolute right-0 bottom-0 outline z-max">
      <svg
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
    <div id="settingsContainer" class="settings absolute right-0 flex flex-column">
      <ToggleDarkMode />
      <button>Toggle all cookies</button>
    </div>
  </div>
</template>

<script>
import ToggleDarkMode from './ToggleDarkMode'
export default {
    components: {
        ToggleDarkMode
    },
    methods: {
        toggleSettings() {
            const settingsBtn = document.getElementById('settingsBtn');
            const settingsContainer = document.getElementById('settingsContainer');

            settingsBtn.classList.toggle('toggled');
            settingsContainer.classList.toggle('open');
        }
    }
};
</script>

<style>
.toggled {
    bottom: 180px
}
.settings.open {
    bottom: 0;
}

.settings {
    bottom: -180px;
}

</style>