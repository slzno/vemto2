<script setup lang="ts">
    import { onMounted } from "vue"
    import { RouterView } from "vue-router"

    onMounted(() => {
        window.api.onDefaultError((error) => console.error(error))
    })
</script>

<template>
    <div
        class="titlebar fixed top-0 right-0 z-50 hover:bg-slate-950 cursor-move"
        style="height: 30px; width: 200px"
    ></div>
    <div id="app" class="w-full h-screen dark">
        <RouterView />
    </div>
</template>
