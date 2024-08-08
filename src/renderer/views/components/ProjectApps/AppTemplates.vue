<script setup lang="ts">
    import { debounce } from "lodash"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted, watch } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import { PlusIcon } from "@heroicons/vue/24/outline"
    import { Wunderbaum } from "wunderbaum"
    import Main from "@Renderer/services/wrappers/Main"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import BasicEditor from "@Renderer/components/editors/BasicEditor.vue"
    import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import TemplateErrorViewer from "../Common/TemplateErrorViewer.vue"
import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"

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
        renderedEditor = ref(null),
        hasRenderErrors = ref(false),
        currentRenderError = ref(null)

    const selectedTemplateTab = ref("template") as Ref<string>

    const templateTabs = [
        { label: "Template", value: "template" },
        { label: "Data", value: "data" },
    ]

    const selectedRenderedTab = ref("rendered") as Ref<string>

    const renderedTabs = [
        { label: "Rendered Code", value: "rendered" },
        { 
            label: "Errors", 
            value: "errors", 
            badge: () => hasRenderErrors.value ? "1" : "0", 
            emphasizeBadge: () => hasRenderErrors.value 
        },
    ]

    onMounted(() => {
        readTemplate("models/Model.vemtl")

        loadTemplates()

        watch(templateContent, debounce(renderTemplate, 150))
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
        renderedContent.value = ""
        renderedEditor.value?.setValue("")

        templateContent.value = await Main.API.readTemplateFile(path)
        templateEditor.value?.setValue(templateContent.value)
        templateData.value = await readTemplateData(templateContent.value)

        renderTemplate()
    }

    const readTemplateData = async (content: string) => {
        // Mudar para o Template Compiler aqui, para obter os templates de import
        let templateData = (new TemplateEngine(content, {
            logger: null,
            onBrowser: true,
            disableImportsProcessing: true,
        })).getDataDefinition()

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

    const renderTemplate = async () => {
        const basePath = "../../../codegen/sequential/services",
            renderableInfo = extractRenderableInfo(templateData.value.renderable.value),
            renderableClass = await import(`${basePath}/${renderableInfo.className}.ts`)

        hasRenderErrors.value = false

        if (!renderableClass) {
            hasRenderErrors.value = true
            throw new Error(`Renderable ${templateData.value.renderable.value} not found`)
        }

        const renderableParams = renderableInfo.constructorParams.map((param) => {
            const dataItem = templateData.value[param]

            if (dataItem.type === "MODEL") {
                return projectStore.findRowByModelIdentifier(dataItem.value, dataItem.selection)
            }

            return dataItem.value
        })

        const renderable = new renderableClass.default(...renderableParams)

        renderable.setOverriddenData(
            getDataForRenderable()
        )

        try {
            renderedContent.value = await renderable.compile(templateContent.value)
    
            renderedEditor.value?.setValue(renderedContent.value)

            // selectedRenderedTab.value = "rendered"
        } catch (error: any) {
            // selectedRenderedTab.value = "errors"
            hasRenderErrors.value = true
            currentRenderError.value = error
            console.error(error)
        }
    }

    const getDataForRenderable = () => {
        const data = {}

        for (const key in templateData.value) {
            const dataItem = templateData.value[key]

            if (dataItem.type === "MODEL") {
                data[key] = projectStore.findRowByModelIdentifier(dataItem.value, dataItem.selection)
            } else {
                data[key] = dataItem.value
            }
        }

        return data
    }

    const extractRenderableInfo = (content: string) => {
        const parts = content.split("("),
            className = parts[0],
            constructorParams = parts[1].replace(")", "").split(",")

        return {
            className,
            constructorParams,
        }
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
        class="h-screen overflow-y-auto pb-20 flex p-2"
    >
        <div class="w-1/5 h-full">
            <div id="templates-tree"></div>
        </div>

        <div class="w-2/5 h-full">
            <UiTabs 
                :name="projectStore.project.getTabNameFor(`templates_code`)" 
                :tabs="templateTabs" 
                v-model="selectedTemplateTab" 
            />

            <div class="h-full" v-show="selectedTemplateTab === 'template'">
                <BasicEditor ref="templateEditor" v-model="templateContent" />
            </div>

            <!-- Template Data -->
            <div class="p-2" v-show="selectedTemplateTab === 'data'">
                <div class="mt-2">
                    <div v-for="(item, key) in templateData" :key="key">
                        <div class="flex items-center space-x-2 space-y-1">
                            <div class="flex-1 w-1/3">
                                <UiText v-model="item.name" />
                            </div>

                            <div class="flex-1 w-1/3">
                                <div v-if="item.type !== 'MODEL'">
                                    <UiText v-model="item.value" @input="renderTemplate" />
                                </div>
    
                                <div v-else>
                                    <UiSelect v-model="item.selection" @change="renderTemplate">    
                                        <option v-for="modelRow in projectStore.getAllRowsByModelIdentifier(item.value)" :value="modelRow.id">
                                            {{ modelRow.name || modelRow.title || modelRow.id }}
                                        </option>
                                    </UiSelect>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-2/5 h-full">
            <UiTabs 
                :name="projectStore.project.getTabNameFor(`templates_rendered_code`)" 
                :tabs="renderedTabs" 
                v-model="selectedRenderedTab" 
            />

            <div class="h-full" v-show="selectedRenderedTab === 'rendered'">
                <BasicEditor ref="renderedEditor" v-model="renderedContent" />
            </div>

            <div class="h-full" v-show="selectedRenderedTab === 'errors'">
                <div v-if="hasRenderErrors" class="text-red-500 p-2">
                    <div v-if="currentRenderError.hasTemplateError">
                        <TemplateErrorViewer
                            :errorMessage="currentRenderError.message"
                            :errorLine="currentRenderError.templateErrorLine"
                            :errorStack="currentRenderError.stack"
                            :template="currentRenderError.templateName"
                            :templateContent="currentRenderError.templateContent"
                        ></TemplateErrorViewer>
                    </div>
                    
                    <div v-else>
                        <pre class="overflow-hidden whitespace-pre-wrap mb-2 text-red-450">{{ currentRenderError.message }}</pre>

                        <div v-if="currentRenderError.stack" class="overflow-auto" style="max-height: calc(100vh - 350px);">
                            <pre class="overflow-hidden whitespace-pre-wrap p-2 bg-slate-950 rounded-lg text-slate-200" style="max-width: 550px;">{{ currentRenderError.stack }}</pre>
                        </div>
                    </div>
                </div>

                <div class="p-8" v-else>
                    <UiEmptyMessage :local="true">
                        No errors found
                    </UiEmptyMessage>
                </div>
            </div>
        </div>
    </div>
</template>
