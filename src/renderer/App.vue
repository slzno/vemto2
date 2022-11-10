<script setup lang="ts">
    import { onMounted } from "vue"
    import { RouterView } from "vue-router"
    import Main from "@Renderer/services/wrappers/Main"

    onMounted(() => {
        Main.API.onDefaultError((error) => { 
            console.error(error.error)
            console.error(error.stack)
        })
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
