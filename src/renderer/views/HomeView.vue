<script setup lang="ts">
const showAlert = () => {
    alert("Hello from Vue3!")
}
</script>

<template>

    <p>
        <input class="p-4 bg-red-100 rounded-lg" type="text" />
    </p>

    <RouterLink 
        class="shadow-md p-4 bg-blue-100 rounded-lg" 
        to="/project/schema">Open Project</RouterLink>

    <button @click="showAlert"></button>
</template>
