
<script setup lang="ts">
    import Main from '@Renderer/services/wrappers/Main'
    import { ref, onMounted } from "vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { ArrowPathIcon } from '@heroicons/vue/24/outline'
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
import ProjectLanguages from '@Renderer/services/project/ProjectLanguages'

    let appConfig = null

    const projectStore = useProjectStore(),
        appDefaultLanguage = ref("en"),
        appLanguages = ref([])

    onMounted(async () => {
        if(!projectStore.project.languages || !projectStore.project.languages.length) {
            await reloadSettings()
            return
        }
    })

    const reloadSettings = async () => {
        await loadSettings()
        
        projectStore.project.languages = appLanguages.value
        projectStore.project.defaultLanguage = appDefaultLanguage.value

        projectStore.project.save()
    }

    const loadSettings = async () => {
        appLanguages.value = await ProjectLanguages.getLanguages()
        appDefaultLanguage.value = await ProjectLanguages.getDefaultLanguage()
    }

</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll"
    >
        <div class="flex space-x-2 sticky py-2">
            <UiButton @click="reloadSettings">
                <ArrowPathIcon class="w-5 h-5 mr-1 text-red-500" />
                Reload
            </UiButton>
        </div>

        <div class="h-[calc(100vh-150px)] overflow-y-auto pr-4 pb-52 mt-4">
            <UiSelect
                v-model="projectStore.project.defaultLanguage"
                label="Default Language"
                placeholder="Select a language"
                @change="projectStore.project.save()">
                <option v-for="language in projectStore.project.languages" :key="language" :value="language">{{ language }}</option>
            </UiSelect>
        </div>
    </div>
</template>
