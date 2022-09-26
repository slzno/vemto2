<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import UiText from "@Renderer/components/ui/UiText.vue"
import UiButton from "@Renderer/components/ui/UiButton.vue"

let projectPath = ref(
    localStorage.getItem("projectPath") || ""
)

const router = useRouter()

const openProject = () : void => {
    localStorage.setItem("projectPath", projectPath.value)
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
