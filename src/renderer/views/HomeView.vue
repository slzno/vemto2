<script setup lang="ts">
import { ref } from "vue"

let message = ref("Hello World!")

const showMessage = () => alert(message.value)

window.electron.ipcRenderer.send("message", "Hello from Home View")
</script>

<template>
    {{ message }}

    <p>
        <input type="text" v-model="message" />
    </p>

    <button @click="showMessage()">Click me</button>
</template>
