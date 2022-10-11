<script setup lang="ts">
    import { ref } from "vue"
    // import { useRouter } from "vue-router"
    import Project from "@Common/models/Project"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import RelaDB from "@tiago_silva_pereira/reladb"
    import Table from "@Renderer/../common/models/Table"

    let projectPath = ref(localStorage.getItem("projectPath") || "")

    // const router = useRouter()
    const projectStore = useProjectStore()

    const openProject = async(): Promise<void> => {
        localStorage.setItem("projectPath", projectPath.value)

        window.api.loadProjectDatabase(projectPath.value)

        window.api.onProjectDatabaseLoaded((databaseData: any) => {
            let database = new RelaDB.Database
            
            database.setDriver(RelaDB.RAMStorage)
    
            RelaDB.Resolver.setDatabase(database)
            RelaDB.Resolver.db().driver.feedDatabaseData(databaseData)
    
            let project = Project.findOrCreate() as Project & TProject
            
            let table = new Table as Table & TTable
            table.name = "teste"
            table.projectId = project.id

            table.save()
    
            project.setPath(projectPath.value)
            
            projectStore.setProject(project)

            console.log('Project tables: ', project.tables)
            console.log(RelaDB.Resolver.db().driver.getDatabaseData())
            
            // router.push("/project/schema")
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
