<template>
  <div>
    <button class="absolute right-0 bottom-0 outline z-max">
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
    <div class="settings absolute right-0 flex flex-column">
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
    }
};
</script>

<style>
.settings {
    bottom: -180px;
}
</style>