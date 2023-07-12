<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/views/components/ProjectNavbar.vue"
    import { onMounted, ref } from "vue"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"

    const canShow = ref(false)

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => canShow.value = true)
    })
</script>

<template>
    <div class="h-full flex">
        <ProjectNavbar />

        <!-- Content -->
        <div v-if="canShow" class="flex-1">
            <RouterView />
        </div>
    </div>
</template>
