<script setup lang="ts">
    import { debounce } from "lodash"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted, watch, computed } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import { ArrowPathIcon, ArrowUturnLeftIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, PlusIcon } from "@heroicons/vue/24/outline"
    import { Wunderbaum } from "wunderbaum"
    import Main from "@Renderer/services/wrappers/Main"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import BasicEditor from "@Renderer/components/editors/BasicEditor.vue"
    import TemplateEngine from "@tiago_silva_pereira/vemto-template-engine"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import TemplateErrorViewer from "../Common/TemplateErrorViewer.vue"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import { pascalCase } from "change-case"
import UiPre from "@Renderer/components/ui/UiPre.vue"
import UiWarning from "@Renderer/components/ui/UiWarning.vue"

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
        selectedTemplate = ref(""),
        templateStatus = ref(""),
        templateContent = ref(""),
        templateOriginalContent = ref(""),
        templateEditor = ref(null),
        templateData = ref({}) as Ref<TemplateData>,
        renderedContent = ref(""),
        renderedEditor = ref(null),
        hasRenderErrors = ref(false),
        currentRenderError = ref(null),
        showingFilesTree = ref(true)

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

        watch(templateContent, () => {
            templateContentChanged()
        })

        showingFilesTree.value = window.localStorage.getItem("showingFilesTree") === "true"
    })

    const hasChanges = computed(() => {
        return templateContent.value !== templateOriginalContent.value
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

    const templateContentChanged = async () => {
        await updateTemplateData()

        debounce(renderTemplate, 150)()
        debounce(saveTemplate, 500)()
    }

    const reloadSelectedTemplate = async () => {
        await readTemplate(selectedTemplate.value)
    }

    const readTemplate = async (path: string) => {
        selectedTemplate.value = path

        renderedContent.value = ""
        renderedEditor.value?.setValue("")

        templateStatus.value = await Main.API.getTemplateStatus(path)
        templateContent.value = await Main.API.readTemplateFile(path)
        templateOriginalContent.value = await Main.API.readOriginalTemplateFile(path)
        templateEditor.value?.setValue(templateContent.value)
        templateData.value = await readTemplateData(templateContent.value)

        renderTemplate()
    }

    const reloadTemplateData = async () => {
        templateData.value = await readTemplateData(templateContent.value)
    }

    const revertToDefaultTemplate = async () => {
        const confirmed = await window.projectConfirm("Are you sure you want to revert to the default template?")

        if(!confirmed) return

        await Main.API.dropCustomTemplate(selectedTemplate.value)

        templateStatus.value = await Main.API.getTemplateStatus(
            selectedTemplate.value
        )

        reloadSelectedTemplate()
    }

    const saveTemplate = async () => {
        if(!hasChanges.value) return

        await Main.API.saveCustomTemplate(
            selectedTemplate.value,
            templateContent.value
        )

        templateStatus.value = await Main.API.getTemplateStatus(
            selectedTemplate.value
        )
    }

    const updateTemplateData = async () => {
        const newTemplateData = await readTemplateData(templateContent.value)

        for (const key in newTemplateData) {
            if (!templateData.value[key] || templateData.value[key].type !== newTemplateData[key].type) {
                templateData.value[key] = newTemplateData[key]
            }
        }

        for (const key in templateData.value) {
            if (!newTemplateData[key]) {
                delete templateData.value[key]
            }
        }
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
        console.log("Rendering template", templateData.value)
        
        const renderableContent = templateData.value.renderable ? templateData.value.renderable.value : ""

        const basePath = "../../../codegen/sequential/services",
            renderableInfo = extractRenderableInfo(renderableContent),
            /* @vite-ignore */
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

    // check if there is a model data item which "id" is undefined or null
    const hasUnknownModelData = () => {
        for (const key in templateData.value) {
            const dataItem = templateData.value[key]

            if (dataItem.type === "MODEL" && !dataItem.selection) {
                return true
            }
        }

        return false
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

    const toggleShowingFilesTree = () => {
        showingFilesTree.value = !showingFilesTree.value
        window.localStorage.setItem("showingFilesTree", showingFilesTree.value ? "true" : "false")
    }
</script>

<template>
    <div
        class="overflow-y-auto pb-20 flex p-2" style="height: calc(100vh - 40px);"
    >
        <div 
            class="h-full" 
            :class="{ 'w-1/5': showingFilesTree, 'w-1/24': !showingFilesTree }"
        >
            <!-- Small button on left side to collapse the div -->
            <div class="flex items-center justify-start p-2">
                <div class="flex items-center space-x-2" title="Collapse/Expand Files Tree">
                    <UiSmallButton @click="toggleShowingFilesTree()">
                        <ChevronDoubleLeftIcon class="w-4 h-4" v-show="showingFilesTree" />
                        <ChevronDoubleRightIcon class="w-4 h-4" v-show="!showingFilesTree" />
                    </UiSmallButton>
                </div>
            </div>

             <div class="h-full" v-show="showingFilesTree">
                 <div id="templates-tree"></div>
             </div>
        </div>

        <div 
            class="flex w-4/5 h-full"
            :class="{ 'w-4/5': showingFilesTree, 'w-23/24': !showingFilesTree }"
        >
            <div class="w-1/2 h-full">
                <UiTabs 
                    :name="projectStore.project.getTabNameFor(`templates_code`)" 
                    :tabs="templateTabs" 
                    v-model="selectedTemplateTab" 
                />
    
                <div class="h-full" v-show="selectedTemplateTab === 'template'">
                    <div class="w-full flex justify-between p-1.5 h-9.5 bg-slate-950">
                        <div class="font-thin flex items-center gap-1">
                            <span>{{ selectedTemplate }}</span>
                            <span class="text-slate-400">({{ pascalCase(templateStatus) }})</span>
                        </div>
    
                        <div>
                            <UiSmallButton 
                                @click="revertToDefaultTemplate"
                                :disabled="templateStatus !== 'custom'"
                            >
                                <ArrowUturnLeftIcon class="w-4 h-4" />
                                <span class="ml-1">Discard Changes</span>
                            </UiSmallButton>
                        </div>
                    </div>
                    
                    <BasicEditor ref="templateEditor" v-model="templateContent" language="vemtl" />
                </div>
    
                <!-- Template Data -->
                <div class="p-1.5" v-show="selectedTemplateTab === 'data'">
                    <div>
                        <div class="flex w-full justify-end">
                            <UiSmallButton @click="reloadTemplateData">
                                <ArrowPathIcon class="w-4 h-4" />
                                <span class="ml-1">Reload Data from Code</span>
                            </UiSmallButton>
                        </div>
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
                                            <option v-for="modelRow in projectStore.getAllRowsByModelIdentifier(item.value, true)" :value="modelRow.id">
                                                {{ modelRow.name || modelRow.title || modelRow.id || '!Missing Data!' }}
                                            </option>
                                        </UiSelect>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="w-1/2 h-full">
                <UiTabs 
                    :name="projectStore.project.getTabNameFor(`templates_rendered_code`)" 
                    :tabs="renderedTabs" 
                    v-model="selectedRenderedTab" 
                />
    
                <div class="h-full" v-show="selectedRenderedTab === 'rendered'">
                    <div class="w-full flex justify-between p-1.5 h-9.5 bg-slate-950">
                        <span>&nbsp;</span>
                    </div>
                    <BasicEditor ref="renderedEditor" v-model="renderedContent" />
                </div>
    
                <div class="h-full" v-show="selectedRenderedTab === 'errors'">
                    <div v-if="hasUnknownModelData()">
                        <div class="p-8">
                            <UiWarning>
                                Some model data is missing. Please add the missing data to the project before trying to render the template.
                            </UiWarning>
                        </div>
                    </div>

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
                            <UiPre class="overflow-hidden mb-2 text-red-450">{{ currentRenderError.message }}</UiPre>
    
                            <div v-if="currentRenderError.stack" class="overflow-auto" style="max-height: calc(100vh - 350px); max-width: 540px;">
                                <UiPre class="p-4 bg-slate-950 rounded-lg text-slate-200">{{ currentRenderError.stack }}</UiPre>
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
    </div>
</template>
