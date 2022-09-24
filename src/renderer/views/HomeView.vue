<script setup lang="ts">
import { ref } from "vue"

let message = ref("Hello World!")

const showMessage = () => alert(message.value)

window.electron.ipcRenderer.send("message", "Hello from Home View")
</script>

<template>
    {{ message }}

    <p>
        <input class="p-4 bg-red-100" type="text" v-model="message" />
    </p>

    <button class="border border-red-200" @click="showMessage()">
        Click me
    </button>
</template>
