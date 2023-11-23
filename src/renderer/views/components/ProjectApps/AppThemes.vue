<script setup lang="ts">
    import { computed } from "vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import GenerateDefaultVthemeKeys from "@Common/models/services/project/GenerateDefaultVthemeKeys"
    import RenderablePreview from "@Renderer/codegen/sequential/services/theme/RenderablePreview"
    import Main from "@Renderer/services/wrappers/Main"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { onMounted, reactive, ref } from "vue"
import UiModal from "@Renderer/components/ui/UiModal.vue"
import UiSelect from "@Renderer/components/ui/UiSelect.vue"
import { ProjectCssFramework } from "@Common/models/Project"

    const projectStore = useProjectStore()

    const vthemeKeys = reactive({}),
        search = ref(""),
        compiledPreview = ref(""),
        showingNewThemeModal = ref(false),
        newThemeSettings = ref({
            cdn: "",
            baseTheme: "tailwind",
        })

    onMounted(async () => {
        readVthemeKeys()
        preview()
    })

    const readVthemeKeys = async () => {
        const templatesFiles = await Main.API.readInternalFolder("templates", true)

        for(let filePath of templatesFiles) {
            const fileContent = await Main.API.readTemplateFile(filePath)

            if(fileContent.includes("vtheme(")) {
                setVthemeKeysFromFileContent(fileContent)
            }
        }

        preview()
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
        preview()
        await projectStore.project.saveVthemeKeys(vthemeKeys)
    }

    const preview = async () => {
        const preview = new RenderablePreview()
        
        compiledPreview.value = await preview.compile()

        const iframe:any = document.getElementById('previewIframe')

        iframe.contentDocument.open()
        iframe.contentDocument.write(compiledPreview.value)
    }

    const saveNewTheme = async () => {
        await (new GenerateDefaultVthemeKeys(projectStore.project)).reset(
            newThemeSettings.value.baseTheme as ProjectCssFramework
        )

        showingNewThemeModal.value = false

        readVthemeKeys()
    }

    const filteredVthemeKeys = computed(() => {
        const filtered = {}

        for(let key of Object.keys(vthemeKeys)) {
            const keyValue = vthemeKeys[key] || ""

            if(key.includes(search.value) || keyValue.includes(search.value)) {
                filtered[key] = vthemeKeys[key]
            }
        }

        return filtered
    })

</script>

<template>
    <UiModal
        width="700px"
        title="New Theme"
        :show="showingNewThemeModal"
        @close="showingNewThemeModal = false"
    >
        <div class="p-4">
            <div class="m-1 flex flex-col gap-4">
                <div>
                    <UiSelect v-model="newThemeSettings.baseTheme" label="Base Theme">
                        <option value="tailwind">TailwindCSS</option>
                        <option value="bootstrap">Bootstrap</option>
                        <option value="bulma">Bulma</option>
                        <option value="foundation">Foundation</option>
                        <option value="other">Empty Theme</option>
                    </UiSelect>
    
                </div>
                
                <div v-show="newThemeSettings.baseTheme === 'other'">
                    <UiText v-model="newThemeSettings.cdn" label="CDN Script (for rendering preview)" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="saveNewTheme()">Save</UiButton>
            </div>
        </template>
    </UiModal>

    <div class="flex h-screen space-x-2">
        <div class="w-1/3 h-full space-y-2">
            <div class="flex space-x-2">
                <UiText v-model="search" placeholder="Search..."></UiText>
                <UiButton @click="showingNewThemeModal = true">New Theme</UiButton>
            </div>
            
            <div class="space-y-2 h-full overflow-auto pb-60">
                <div v-for="key in Object.keys(filteredVthemeKeys)">
                    <UiTextarea class="font-mono" v-model="vthemeKeys[key]" :label="key" @input="saveVthemeKeys()" />
                </div>
            </div>
        </div>

        <div class="w-2/3 h-full bg-white rounded">
            <iframe id="previewIframe" class="w-full h-full" frameborder="0"></iframe>
        </div>
    </div>
</template>
 