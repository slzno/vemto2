<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/views/components/ProjectNavbar.vue"
    import { onMounted } from "vue"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"

    onMounted(async () => {
        await HandleProjectDatabase.populate()
    })
</script>

<template>
    <div class="h-full flex">
        <ProjectNavbar />

        <!-- Content -->
        <div class="flex-1">
            <RouterView />
        </div>
    </div>
</template>
