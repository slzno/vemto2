<script setup lang="ts">
    import { ref } from "vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import DotEnvEditor from "@Renderer/views/components/ProjectSettings/DotEnvEditor.vue"
import LanguagesEditor from "./components/ProjectSettings/LanguagesEditor.vue"
import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"

    const projectStore = useProjectStore()
    const selectedTab = ref("env")

    const tabs = [
        { label: "Environment", value: "env" },
        { label: "Translations", value: "lang" },
        { label: "Code", value: "code" },
        { label: "Paths", value: "paths" },
    ]
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll"
    >
        <div class="mt-2">
            <UiTabs 
                :name="projectStore.project.getTabNameFor('env')" 
                :tabs="tabs" 
                v-model="selectedTab" 
            />
        </div>

        <div class="p-4" v-if="selectedTab === 'env'">
            <DotEnvEditor />
        </div>

        <div class="p-4" v-if="selectedTab === 'lang'">
            <div class="w-96">
                <LanguagesEditor />
            </div>
        </div>

        <div class="p-4" v-if="selectedTab === 'code'">
            <UiEmptyMessage>
                Under development
            </UiEmptyMessage>
        </div>

        <div class="p-4" v-if="selectedTab === 'paths'">
            <UiEmptyMessage>
                Under development
            </UiEmptyMessage>
        </div>
    </div>
</template>
