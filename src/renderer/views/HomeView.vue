<script setup lang="ts">
    import { ref, watch } from "vue"
    import { useRouter } from "vue-router"
    import Project from "@Common/models/Project"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"

    let projectPath = ref(localStorage.getItem("projectPath") || ""),
        initialDataLoaded = ref(false),
        initialDatabaseData = {}

    const router = useRouter()
    const projectStore = useProjectStore()

    watch(initialDataLoaded, () => {
        HandleProjectDatabase.start(initialDatabaseData)

        let project = Project.findOrCreate()

        project.setPath(projectPath.value)
        
        projectStore.setProject(project)
        
        router.push("/project/schema")
    })

    const openProject = async() => {
        localStorage.setItem("projectPath", projectPath.value)

        window.api.loadProjectDatabase(projectPath.value)
        window.api.onProjectDatabaseLoaded(data => { 
            initialDatabaseData = data 
            initialDataLoaded.value = true
        })
    }
</script>

<template>
    <section class="p-4 space-y-4">
        <p>
            <UiText v-model="projectPath" />
        </p>

        <UiButton @click="openProject">Open Project</UiButton>
    </section>
</template>
