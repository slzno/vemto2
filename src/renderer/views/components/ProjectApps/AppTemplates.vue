<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import { PlusIcon } from "@heroicons/vue/24/outline"
    import { Wunderbaum } from "wunderbaum"
    import Main from "@Renderer/services/wrappers/Main"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import BasicEditor from "@Renderer/components/editors/BasicEditor.vue"
    import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"
import UiSelect from "@Renderer/components/ui/UiSelect.vue"

    type TemplateDataType = "MODEL" | "JSON" | "STRING" | "RENDERABLE"

    interface TemplateDataItem {
        name: string
        type: TemplateDataType
        value: any
        selection: any
    }

    interface TemplateData {
        [key: string]: TemplateDataItem
    }

    const projectStore = useProjectStore(),
        templates = ref([]) as Ref<string[]>,
        files = ref([]) as Ref<any[]>,
        templateContent = ref(""),
        templateEditor = ref(null),
        templateData = ref({}) as Ref<TemplateData>,
        renderedContent = ref(""),
        renderedEditor = ref(null)

    onMounted(() => {
        loadTemplates()
    })

    const loadTemplates = async () => {
        setTimeout(async () => {
            templates.value = await Main.API.listTemplates()
            files.value = generateStructure(templates.value)

            const tree = new Wunderbaum({
                element: document.getElementById(
                    "templates-tree"
                ) as HTMLDivElement,
                source: generateStructure(templates.value),
                init: (e) => {
                    e.tree.setFocus()
                },
                activate: (e) => {
                    const path = e.node?.data?.path
                    if(!path) return

                    readTemplate(path)
                },
            })
        }, 100)
    }

    const readTemplate = async (path: string) => {
        templateContent.value = await Main.API.readTemplateFile(path)
        templateEditor.value?.setValue(templateContent.value)
        templateData.value = await readTemplateData(templateContent.value)

        console.log(templateData.value)
    }

    const readTemplateData = async (content: string) => {
        let templateData = (new TemplateEngine(content)).getDataDefinition()

        // delete 'project' key as it is read-only
        delete templateData.project

        // select the first model for each model type
        for (const key in templateData) {
            if (templateData[key].type === "MODEL") {
                const rows = projectStore.getAllRowsByModelIdentifier(templateData[key].value),
                    firstRowId = rows[0] ? rows[0].id : null

                templateData[key].selection = firstRowId
            }
        }

        return templateData
    }

    const generateStructure = (filePaths) => {
        const structure = []

        filePaths.forEach((filePath) => {
            const parts = filePath.split("/").filter((part) => part)
            let currentLevel = structure

            parts.forEach((part, index) => {
                let existingPath = currentLevel.find(
                    (item) => item.title === part
                )
                if (!existingPath) {
                    existingPath = {
                        title: part,
                        expanded: false,
                        children: [],
                    }
                    if (index === parts.length - 1) {
                        existingPath.path = filePath
                        delete existingPath.children
                    }
                    currentLevel.push(existingPath)
                }
                currentLevel = existingPath.children || []
            })
        })

        return structure
    }
</script>

<template>
    <!-- <div class="mb-3 flex space-x-2">
        <UiButton>
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Add Section
        </UiButton>
    </div> -->

    <div
        class="h-screen overflow-y-auto pb-96 flex p-2"
    >
        <div class="w-1/5 h-full">
            <div id="templates-tree"></div>
        </div>

        <div class="w-2/5 h-full">
            <BasicEditor ref="templateEditor" v-model="templateContent" />

            <!-- Data -->
            <div>
                <div class="text-lg font-bold mt-4">Data</div>
                <div class="mt-2">
                    <div v-for="(item, key) in templateData" :key="key">
                        <div class="flex items-center space-x-2">
                            <UiText v-model="item.name" />
                            <UiSelect v-model="item.type">
                                <option value="MODEL">Model</option>
                                <option value="JSON">JSON</option>
                                <option value="STRING">String</option>
                                <option value="RENDERABLE">Renderable</option>
                            </UiSelect>

                            <div v-if="item.type !== 'MODEL'">
                                <UiText v-model="item.value" />
                            </div>

                            <div v-else>
                                <UiSelect v-model="item.selection">
                                    <option v-for="modelRow in projectStore.getAllRowsByModelIdentifier(item.value)" :value="modelRow.id">
                                        {{ modelRow.name }}
                                    </option>
                                </UiSelect>
                            </div>
                        </div>
                    </div>
                </div>
                <UiButton>
                    <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
                    Add Data
                </UiButton>
            </div>
        </div>

        <div class="w-2/5 h-full">
            <BasicEditor v-model="renderedContent" />
        </div>
    </div>
</template>
