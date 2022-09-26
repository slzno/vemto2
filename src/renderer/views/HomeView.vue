<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import Project from "@Common/models/Project";
import UiText from "@Renderer/components/ui/UiText.vue"
import UiButton from "@Renderer/components/ui/UiButton.vue"
import { useProjectStore } from "@Renderer/stores/useProjectStore";

let projectPath = ref(
    localStorage.getItem("projectPath") || ""
)

const router = useRouter()
const projectStore = useProjectStore()

const openProject = () : void => {
    localStorage.setItem("projectPath", projectPath.value)

    let project = new Project
    project.setPath(projectPath.value)

    projectStore.setProject(project)

    router.push("/project/schema")
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
