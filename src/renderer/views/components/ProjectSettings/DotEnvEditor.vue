
<script setup lang="ts">
    import Draggable from "vuedraggable"
    import Main from '@Renderer/services/wrappers/Main'
    import { ref, computed, onMounted } from "vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { ArrowDownTrayIcon, ArrowPathIcon, Bars2Icon, Bars3Icon, ClipboardDocumentListIcon, TrashIcon } from '@heroicons/vue/24/outline'
import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"

    const projectStore = useProjectStore(),
        envSettings = ref([])
    
    let currentEnvSettings = null

    onMounted(async () => {
        await readEnvSettings()
    })

    // computed has changes
    const hasChanges = computed(() => {
        return JSON.stringify(envSettings.value) !== JSON.stringify(currentEnvSettings)
    })

    const reloadSettings = async () => {
        await readEnvSettings()
    }

    const readEnvSettings = async () => {
        const fileContent = await Main.API.readProjectFile(".env")

        const parsed = parseEnv(fileContent)

        envSettings.value = cloneObject(parsed)
        currentEnvSettings = cloneObject(parsed)
    }

    const cloneObject = (obj) => {
        return JSON.parse(JSON.stringify(obj))
    }

    const addValue = () => {
        envSettings.value.unshift({ key: "", value: "" })
    }

    const addLineBreak = () => {
        envSettings.value.unshift({ key: "ENV_LINE_SEPARATOR", value: "ENV_LINE_SEPARATOR" })
    }

    const addValueAbove = (setting) => {
        const index = envSettings.value.indexOf(setting)

        envSettings.value.splice(index, 0, { key: "", value: "" })
    }

    const addValueBelow = (setting) => {
        const index = envSettings.value.indexOf(setting)

        envSettings.value.splice(index + 1, 0, { key: "", value: "" })
    }

    const addLineBreakAbove = (setting) => {
        const index = envSettings.value.indexOf(setting)

        envSettings.value.splice(index, 0, { key: "ENV_LINE_SEPARATOR", value: "ENV_LINE_SEPARATOR" })
    }

    const addLineBreakBelow = (setting) => {
        const index = envSettings.value.indexOf(setting)

        envSettings.value.splice(index + 1, 0, { key: "ENV_LINE_SEPARATOR", value: "ENV_LINE_SEPARATOR" })
    }

    const dropSetting = (setting) => {
        const index = envSettings.value.indexOf(setting)

        envSettings.value.splice(index, 1)
    }

    const saveEnvSettings = async () => {
        let content = envSettings.value.map(setting => {
            if (setting.key === "ENV_LINE_SEPARATOR") {
                return "\n"
            }
            
            return `${setting.key}=${setting.value}\n`
        }).join("")

        content = content.slice(0, -1)

        await Main.API.writeProjectFile(".env", content)

        await readEnvSettings()
    }

    const parseEnv = (envContent) => {
        const lines = envContent.split(/\r?\n/) // Split the content by line breaks
        const result = []

        lines.forEach(line => {
            // Check for empty line (line break)
            if (line.trim() === '') {
                result.push({ key: "ENV_LINE_SEPARATOR", value: "ENV_LINE_SEPARATOR" })
            } else {
                let [key, value] = line.split('=')

                // remove any line breaks from the value
                value = value.replace(/\r?\n|\r/g, "")

                result.push({ key: key.trim(), value: value.trim() })
            }
        })

        return result
    }
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll"
    >
        <div class="flex space-x-2 sticky py-2">
            <!-- <UiButton @click="addValue()">
                <ClipboardDocumentListIcon class="w-5 h-5 mr-1 text-red-500" />
                Add Value
            </UiButton>

            <UiButton @click="addLineBreak()">
                <Bars2Icon class="w-5 h-5 mr-1 text-red-500" />
                Add Separator
            </UiButton> -->

            <UiButton @click="reloadSettings">
                <ArrowPathIcon class="w-5 h-5 mr-1 text-red-500" />
                Reload
            </UiButton>

            <UiButton :disabled="!hasChanges" @click="saveEnvSettings">
                <ArrowDownTrayIcon class="w-5 h-5 mr-1 text-red-500" />
                Save
            </UiButton>
        </div>

        <div class="h-[calc(100vh-150px)] overflow-y-auto pr-4 pb-52">
            <Draggable
                class="space-y-2"
                handle=".handle"
                :list="envSettings"
                item-key="columns-draggable"
            >
                <template #item="{ element: setting }">
                    <div class="flex space-x-2 items-center">
                        <div class="px-2 handle">
                            <Bars3Icon
                                class="w-4 h-4 text-slate-600 hover:text-red-500 cursor-move"
                            />
                        </div>
                        <div class="flex-1">
                            <div v-if="setting.key === 'ENV_LINE_SEPARATOR'" class="flex justify-center py-4">
                                <div class="border-t-2 border-slate-800 w-20 h-1"></div>
                            </div>
                            <div v-else class="flex flex-row items-center space-x-2 py-2">
                                <div class="w-1/3">
                                    <UiText class="font-bold" v-model="setting.key" />
                                </div>
                                <UiText v-model="setting.value" />
                            </div>
                        </div>
                        <div>
                            <UiOptionsDropdown size="w-64">
                                <UiDropdownItem @click="addValueAbove(setting)">
                                    <ClipboardDocumentListIcon class="w-4 h-4 mr-1 text-red-500" />
                                    Add value above
                                </UiDropdownItem>
                                <UiDropdownItem @click="addLineBreakAbove(setting)">
                                    <Bars2Icon class="w-4 h-4 mr-1 text-red-500" />
                                    Add separator above
                                </UiDropdownItem>
                                <UiDropdownItem @click="addValueBelow(setting)">
                                    <ClipboardDocumentListIcon class="w-4 h-4 mr-1 text-red-500" />
                                    Add value below
                                </UiDropdownItem>
                                <UiDropdownItem @click="addLineBreakBelow(setting)">
                                    <Bars2Icon class="w-4 h-4 mr-1 text-red-500" />
                                    Add separator below
                                </UiDropdownItem>
                                <UiDropdownItem @click="dropSetting(setting)">
                                    <TrashIcon class="w-4 h-4 mr-1 text-red-500" />
                                    Delete
                                </UiDropdownItem>
                            </UiOptionsDropdown>
                        </div>
                    </div>
                </template>
            </Draggable>
        </div>
    </div>
</template>
