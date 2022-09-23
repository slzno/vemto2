<script setup lang="ts">
import { ref } from "vue"

const msg = ref("Electron + Vue3 template")
</script>

<template>
  <div id="hello">
    <p>
      {{ msg }}
    </p>

    <input type="text" v-model="msg" />
  </div>
</template>
