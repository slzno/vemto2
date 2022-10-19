<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/components/ProjectNavbar.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { onMounted } from "vue"
    import Project from "@Renderer/../common/models/Project"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"

    const projectStore = useProjectStore()

    onMounted(async () => {
        if (projectStore.projectIsEmpty) {
            const latestProjectPath = window.localStorage.getItem("latest-project")

            const data = await window.api.loadProjectDatabase(latestProjectPath)
            
            HandleProjectDatabase.start(data)
            
            projectStore.setProject(Project.find(1))
        }
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
