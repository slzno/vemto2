<script setup lang="ts">
window.electron.ipcRenderer.send("message", "Hello from Home View");
</script>

<template>
    Test
</template>