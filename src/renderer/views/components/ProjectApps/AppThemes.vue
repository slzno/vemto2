<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
import UiText from "@Renderer/components/ui/UiText.vue"
import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
import GenerateDefaultVthemeKeys from "@Common/models/services/project/GenerateDefaultVthemeKeys"
    import Main from "@Renderer/services/wrappers/Main"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { onMounted, reactive, ref } from "vue"

    const projectStore = useProjectStore()

    const vthemeKeys = reactive({})

    onMounted(async () => {
        readVthemeKeys()
    })

    const readVthemeKeys = async () => {
        const templatesFiles = await Main.API.readInternalFolder("templates", true)

        for(let filePath of templatesFiles) {
            const fileContent = await Main.API.readTemplateFile(filePath)

            if(fileContent.includes("<# use vtheme #>")) {
                setVthemeKeysFromFileContent(fileContent)
            }
        }
    }

    const setVthemeKeysFromFileContent = (content: string) => {
        const regex = /vtheme\((.*?)\)/g,
            matches = content.match(regex)

        if(!matches) return

        for(let match of matches) {
            const key = match.replace("vtheme(", "").replace(")", "")

            if(!vthemeKeys[key]) {
                vthemeKeys[key] = projectStore.project.getVthemeKey(key)
            }
        }
    }

    const saveVthemeKeys = async () => {
        await projectStore.project.saveVthemeKeys(vthemeKeys)
    }

    const resetTheme = async () => {
        if(!Main.API.confirm("Are you sure you want to reset the theme?")) return

        await (new GenerateDefaultVthemeKeys(projectStore.project)).reset()
        readVthemeKeys()
    }

</script>

<template>
    <div class="flex h-screen space-x-2">
        <div class="w-1/3 h-full space-y-2">
            <div>
                <UiButton @click="resetTheme()">Reset Theme</UiButton>
            </div>
            
            <div class="space-y-2">
                <div v-for="key in Object.keys(vthemeKeys)">
                    <UiTextarea v-model="vthemeKeys[key]" :label="key" @input="saveVthemeKeys()" />
                </div>
            </div>
        </div>

        <div class="w-2/3 h-full bg-white rounded">
            
        </div>
    </div>
</template>
 