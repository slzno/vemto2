<script setup lang="ts">
    import { ref } from "vue"
    import { useRouter } from "vue-router"
    import Project from "@Common/models/Project"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"

    let projectPath = ref(localStorage.getItem("projectPath") || "")

    const router = useRouter()
    const projectStore = useProjectStore()

    const openProject = async() => {
        localStorage.setItem("projectPath", projectPath.value)

        await window.api.prepareProject(projectPath.value)
        
        const databaseData = await window.api.loadProjectDatabase(projectPath.value)

        HandleProjectDatabase.start(databaseData)

        let project = Project.findOrCreate()

        project.setPath(projectPath.value)
        project.save()
        
        projectStore.setProject(project)
        
        window.localStorage.setItem("latest-project", projectPath.value)

        router.push("/project/schema")
    }
</script>

<template>
    <section class="p-4 space-y-4 dark:bg-slate-900 h-screen">
        <p>
            <UiText v-model="projectPath" />
        </p>

        <UiButton @click="openProject">Open Project</UiButton>
    </section>
</template>
