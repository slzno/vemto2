<script setup lang="ts">
    import { debounce } from "lodash"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, Ref, onMounted, watch, computed } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import { ArrowDownCircleIcon, ArrowPathIcon, ArrowUturnLeftIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, PlusIcon } from "@heroicons/vue/24/outline"
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
    import CodeComparer from "@Common/services/CodeComparer"
    import CustomRenderable from "@Renderer/codegen/sequential/services/custom/CustomRenderable"
    import CodeChangesCompare from "../Common/CodeChangesCompare.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
import UiDropdownSeparator from "@Renderer/components/ui/UiDropdownSeparator.vue"
import PathUtil from "@Common/util/PathUtil"
    
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
        showingFilesTree = ref(true),
        isUpgradable = ref(false)

    const selectedTemplateTab = ref("template") as Ref<string>
    
    const templateTabsRef = ref(null)
    const templateTabs = [
        { label: "Template", value: "template" },
        { label: "Data", value: "data" },
    ]

    const selectedRenderedTab = ref("rendered") as Ref<string>

    const renderedTabsRef = ref(null)
    const renderedTabs = [
        { label: "Rendered Code", value: "rendered" },
        { 
            label: "Errors", 
            value: "errors", 
            badge: () => hasRenderErrors.value ? "1" : "0", 
            emphasizeBadge: () => hasRenderErrors.value 
        },
    ]

    const codeChangesCompareRef = ref(null)

    const queryInput = ref("")

    onMounted(() => {
        templateTabsRef.value.setTab("template")
        renderedTabsRef.value.setTab("rendered")
        
        readTemplate("models/Model.vemtl")

        loadTemplates()

        watch(templateContent, (content) => {
            templateContentChanged()
        })

        showingFilesTree.value = window.localStorage.getItem("showingFilesTree") === "true"
    })

    const hasChanges = computed(() => {
        if(!templateOriginalContent.value) return false

        return CodeComparer.codeIsDifferent(
            templateContent.value,
            templateOriginalContent.value
        )
    })

    const loadTemplates = async () => {
        setTimeout(async () => {
            templates.value = await Main.API.listTemplates()
            files.value = generateStructure(templates.value)

            const tree = new Wunderbaum({
                element: document.getElementById(
                    "templates-tree"
                ) as HTMLDivElement,
                autoCollapse: true,
                source: generateStructure(templates.value),
                filter: {
                    connectInput: "input#filterQuery",
                    autoApply: true,
                    autoExpand: true, // Auto-expand to show filtered items
                    matchBranch: false,
                    fuzzy: false,
                    hideExpanders: false,
                    highlight: true,
                    leavesOnly: false,
                    mode: "hide",
                    noData: true,
                },
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
        hasRenderErrors.value = false
        currentRenderError.value = null
        
        try {
            templateStatus.value = await Main.API.getTemplateStatus(path)
            templateContent.value = await Main.API.readTemplateFile(path)
            templateOriginalContent.value = await Main.API.readPublishedTemplateFile(path)
            templateEditor.value?.setValue(templateContent.value)
            templateData.value = await readTemplateData(templateContent.value)
            
            isUpgradable.value = await checkIfTemplateIsUpgradable()

            renderTemplate()
        } catch (error: any) {
            hasRenderErrors.value = true
            currentRenderError.value = error
            console.error(error)
        }
    }

    const checkIfTemplateIsUpgradable = async () => {
        const publishedContent = await Main.API.readPublishedTemplateFile(selectedTemplate.value),
            defaultContent = await Main.API.readDefaultTemplateFile(selectedTemplate.value)

        return CodeComparer.codeIsDifferent(
            publishedContent,
            defaultContent
        )
    }

    const reloadTemplateData = async () => {
        templateData.value = await readTemplateData(templateContent.value)
    }

    const revertToPublishedTemplate = async () => {
        const originalContent = await Main.API.readPublishedTemplateFile(selectedTemplate.value)
        const customContent = templateContent.value
    
        codeChangesCompareRef.value.show({
            title: "Revert to Published Template",
            firstCode: customContent,
            firstCodeTitle: "Current Template",
            secondCode: originalContent,
            secondCodeTitle: "New Template",
            onConfirm: async () => {
                await Main.API.dropCustomTemplate(selectedTemplate.value)
                templateStatus.value = await Main.API.getTemplateStatus(selectedTemplate.value)
                reloadSelectedTemplate()
            }
        })
    }

    const upgradeCustomTemplate = async () => {
        const customContent = templateContent.value
        const defaultContent = await Main.API.readDefaultTemplateFile(selectedTemplate.value)
    
        codeChangesCompareRef.value.show({
            title: "Upgrade Custom Template",
            firstCode: customContent,
            firstCodeTitle: "Custom Template",
            secondCode: defaultContent,
            secondCodeTitle: "Upgraded Template",
            onConfirm: async () => {
                await Main.API.upgradeCustomTemplate(selectedTemplate.value)
                reloadSelectedTemplate()
            }
        })
    }

    const upgradePublishedTemplate = async () => {
        const publishedContent = await Main.API.readPublishedTemplateFile(selectedTemplate.value)
        const defaultContent = await Main.API.readDefaultTemplateFile(selectedTemplate.value)
    
        codeChangesCompareRef.value.show({
            title: "Upgrade Published Template",
            firstCode: publishedContent,
            firstCodeTitle: "Published Template",
            secondCode: defaultContent,
            secondCodeTitle: "Upgraded Template",
            onConfirm: async () => {
                await Main.API.upgradePublishedTemplate(selectedTemplate.value)
                reloadSelectedTemplate()
            }
        })
    }

    const openCustomTemplate = async () => {
        const path = PathUtil.join(".vemto", "templates", "custom", selectedTemplate.value)
        Main.API.openProjectFile(path)
    }

    const openPublishedTemplate = async () => {
        const path = PathUtil.join(".vemto", "templates", "published", selectedTemplate.value)
        Main.API.openProjectFile(path)
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
        try {
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
        } catch (error: any) {
            hasRenderErrors.value = true
            currentRenderError.value = error
            console.error(error)
        }
    }

    const readTemplateData = async (content: string) => {
        try {
            // Mudar para o Template Compiler aqui, para obter os templates de import
            let templateData = (new TemplateEngine(content, {
                logger: null,
                onBrowser: true,
                disableImportsProcessing: true,
            })).getDataDefinition()
    
            // select the first model for each model type
            for (const key in templateData) {
                if (templateData[key].type === "MODEL") {
                    let modelIdentifier = templateData[key].value,
                        mode = "single"
    
                    if(modelIdentifier.includes("[]")) {
                        mode = "multiple"
                        modelIdentifier = modelIdentifier.replace("[]", "")
                    }
    
                    const rows = projectStore.getAllRowsByModelIdentifier(modelIdentifier),
                        firstRowId = rows[0] ? rows[0].id : null,
                        allRows = rows.map((row) => row.id)
    
                    templateData[key].selection = mode === "single" ? firstRowId : allRows
                }
            }
    
            return templateData
        } catch (error: any) {
            hasRenderErrors.value = true
            currentRenderError.value = error
            console.error(error)
        }
    }

    const renderTemplate = async () => {
        console.log("Rendering template", templateData.value)

        if(!selectedTemplate.value.endsWith(".vemtl")) return

        hasRenderErrors.value = false
        currentRenderError.value = null
        
        try {
            if(!templateContent.value.includes("DATA:RENDERABLE")) {
                hasRenderErrors.value = true
                currentRenderError.value = new Error("Please add the <# TEMPLATE DATA #> section to the template before rendering it.")
                return
            }

            const renderableInfo = extractRenderableInfo(),
                renderableClass = await setupRenderableClass(renderableInfo),
                renderableParams = await setupRenderableParams(renderableInfo)
    
            const renderable = new renderableClass(...renderableParams)
    
            renderable.setOverriddenData(
                getDataForRenderable()
            )

            const templateContentWithExposed = addExposedVariables(templateContent.value)

            renderedContent.value = await renderable.compile(templateContentWithExposed)
    
            renderedEditor.value?.setValue(renderedContent.value)

            selectedRenderedTab.value = "rendered"
        } catch (error: any) {
            // selectedRenderedTab.value = "errors"
            hasRenderErrors.value = true
            currentRenderError.value = error
            console.error(error)
        }
    }

    const setupRenderableClass = async (renderableInfo: any) => {
        if(renderableInfo.className === "CustomRenderable") {
            return CustomRenderable
        }

        const basePath = "../../../codegen/sequential/services",
            /* @vite-ignore */
            renderableClass = await import(/* @vite-ignore */`${basePath}/${renderableInfo.className}.ts`)

        hasRenderErrors.value = false

        if (!renderableClass) {
            hasRenderErrors.value = true
            throw new Error(`Renderable ${templateData.value.renderable.value} not found`)
        }

        return renderableClass.default
    }

    const setupRenderableParams = async (renderableInfo: any) => {
        const renderableParams = renderableInfo.constructorParams.map((param) => {
            const dataItem = templateData.value[param]

            if (!dataItem) {
                throw new Error(`Constructor param "${param}" not found in the template data`)
            }

            if (dataItem.type === "MODEL") {
                let modelIdentifier = dataItem.value

                if(Array.isArray(dataItem.selection)) {
                    modelIdentifier = modelIdentifier.replace("[]", "")

                    return dataItem.selection.filter((id) => id)
                        .map((id) => projectStore.findRowByModelIdentifier(modelIdentifier, id))
                }

                return projectStore.findRowByModelIdentifier(modelIdentifier, dataItem.selection)
            }

            return dataItem.value
        })

        return renderableParams
    }

    const getDataForRenderable = () => {
        const data = {}

        for (const key in templateData.value) {
            const dataItem = templateData.value[key]
            
            let modelIdentifier = dataItem.value

            if (dataItem.type === "MODEL") {
                if(Array.isArray(dataItem.selection)) {
                    modelIdentifier = modelIdentifier.replace("[]", "")

                    data[key] = dataItem.selection.filter((id) => id)
                        .map((id) => projectStore.findRowByModelIdentifier(modelIdentifier, id))
                } else {
                    data[key] = projectStore.findRowByModelIdentifier(modelIdentifier, dataItem.selection)
                }
            } else {
                data[key] = dataItem.value
            }
        }

        return data
    }

    // read the data item exposed_variables, get all items separated by comma
    // and add them to the template code like this:
    // <% const var = this.var %>
    // <% const var2 = this.var2 %> and so on
    const addExposedVariables = (templateContent: string) => {
        const exposedVariables = templateData.value.exposed_variables?.value

        if (!exposedVariables) {
            return templateContent
        }

        const variables = exposedVariables.split(",").map((variable) => variable.trim())

        let newContent = templateContent

        variables.forEach((variable) => {
            newContent = `<% const ${variable} = this.${variable} %>\n${newContent}`
        })

        return newContent
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

    const extractRenderableInfo = () => {
        const renderableContent = templateData.value.renderable ? templateData.value.renderable.value : ""

        const parts = renderableContent.split("("),
            className = parts[0]
        
        let constructorParams = parts[1].replace(")", "").split(",")

        constructorParams = constructorParams.map((param) => param.trim()).filter((param) => param)

        return {
            className,
            constructorParams,
        }
    }

    const generateStructure = (filePaths) => {
        const structure = []

        filePaths.forEach((filePath) => {
            if (filePath.endsWith(".md")) {
                return
            }

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

        // Sort folders before files
        const sortStructure = (items) => {
            items.sort((a, b) => {
                if (a.children && !b.children) return -1
                if (!a.children && b.children) return 1
                return a.title.localeCompare(b.title)
            })

            items.forEach((item) => {
                if (item.children) {
                    sortStructure(item.children)
                }
            })
        }

        sortStructure(structure)

        return structure
    }

    const toggleShowingFilesTree = () => {
        showingFilesTree.value = !showingFilesTree.value
        window.localStorage.setItem("showingFilesTree", showingFilesTree.value ? "true" : "false")
    }
</script>

<template>
    <div
        class="overflow-hidden flex" style="height: calc(100vh - 40px);"
    >
        <div
            id="files-tree" 
            class="flex-none h-full border-r border-slate-700" 
            :class="{ 'w-[332px]': showingFilesTree, 'w-1/24': !showingFilesTree }"
        >
            <!-- Small button on left side to collapse the div -->
            <div class="flex flex-col justify-between p-2 space-y-2">
                <div class="flex items-center space-x-2" title="Collapse/Expand Files Tree">
                    <UiSmallButton @click="toggleShowingFilesTree()">
                        <ChevronDoubleLeftIcon class="w-4 h-4" v-show="showingFilesTree" />
                        <ChevronDoubleRightIcon class="w-4 h-4" v-show="!showingFilesTree" />
                    </UiSmallButton>
                </div>

                <div class="w-3/4" v-show="showingFilesTree">
                    <UiText id="filterQuery" v-model="queryInput" placeholder="Search templates..." />
                </div>
            </div>

             <div class="h-full" style="height: calc(70%);" v-show="showingFilesTree">
                 <div id="templates-tree"></div>
             </div>
        </div>

        <div 
            id="editors-container"
            class="flex flex-none h-full overflow-hidden pt-2"
            :class="{ 'w-[calc(100%-332px)]': showingFilesTree, 'w-23/24': !showingFilesTree }"
        >
            <div class="w-1/2 flex-none h-full">
                <UiTabs 
                    ref="templateTabsRef"
                    :name="projectStore.project.getTabNameFor(`templates_code`)" 
                    :tabs="templateTabs" 
                    v-model="selectedTemplateTab" 
                />
    
                <div class="h-full" v-show="selectedTemplateTab === 'template'">
                    <div class="w-full flex py-2 px-4 bg-slate-950">
                        <div class="flex-1 font-thin flex items-center gap-1 truncate text-sm" :title="selectedTemplate">
                            <span :class="templateStatus === 'custom' ? 'text-red-500' : 'text-green-500'">
                                {{ pascalCase(templateStatus) }}
                            </span>
                            <span>
                                - {{ selectedTemplate }}
                            </span>
                            <span v-if="isUpgradable" class="text-yellow-500">
                                (Upgradable)
                            </span>
                        </div>
    
                        <div class="flex-none flex space-x-1 justify-end">
                            <UiOptionsDropdown size="w-96">
                                <UiDropdownItem :disabled="templateStatus !== 'custom'" @click="revertToPublishedTemplate">
                                    <ArrowUturnLeftIcon class="h-5 w-5 mr-2 text-red-400" /> Compare & Revert to Published Template
                                </UiDropdownItem>

                                <UiDropdownItem :disabled="templateStatus !== 'custom'" @click="upgradeCustomTemplate">
                                    <ArrowDownCircleIcon class="h-5 w-5 mr-2 text-green-400" /> Compare & Upgrade Custom Template
                                </UiDropdownItem>

                                <UiDropdownItem @click="upgradePublishedTemplate">
                                    <ArrowDownCircleIcon class="h-5 w-5 mr-2 text-green-400" /> Compare & Upgrade Published Template
                                </UiDropdownItem>

                                <UiDropdownSeparator />

                                <UiDropdownItem :disabled="templateStatus !== 'custom'" @click="openCustomTemplate">
                                    <ArrowDownCircleIcon class="h-5 w-5 mr-2 text-green-400" /> Open Custom Template
                                </UiDropdownItem>

                                <UiDropdownItem @click="openPublishedTemplate">
                                    <ArrowDownCircleIcon class="h-5 w-5 mr-2 text-green-400" /> Open Published Template
                                </UiDropdownItem>
                            </UiOptionsDropdown>
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
                                <div class="flex-1 w-1/3" :title="item.type">
                                    <UiText v-model="item.name" />
                                </div>
    
                                <div class="flex-1 w-1/3">
                                    <div v-if="item.type !== 'MODEL'">
                                        <UiText v-model="item.value" @input="renderTemplate" />
                                    </div>
        
                                    <div v-else>
                                        <template v-if="Array.isArray(item.selection)">
                                            <span>
                                                Collection of {{ item.value }}
                                            </span>
                                        </template>

                                        <template v-else>
                                        <UiSelect 
                                            v-model="item.selection" 
                                            @change="renderTemplate"
                                        >    
                                            <option
                                                v-for="modelRow in projectStore.getAllRowsByModelIdentifier(item.value, true)" :value="modelRow.id"
                                            >
                                                {{ modelRow.name || modelRow.title || modelRow.id || '! Missing Data: ' + item.value }}
                                            </option>
                                        </UiSelect>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="w-1/2 flex-none h-full">
                <UiTabs 
                    ref="renderedTabsRef"
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
                                Some model data is missing. Please add the missing data to the project before trying to preview or edit the template.
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
                        
                        <div style="max-height: calc(100vh - 350px);" v-else>
                            
                            <div v-if="currentRenderError.stack" class="overflow-auto p-4 bg-slate-950 rounded-lg text-slate-200">
                                <UiPre class="overflow-hidden mb-2 text-red-450">{{ currentRenderError.message }}</UiPre>

                                <UiPre class="overflow-hidden whitespace-pre-wrap break-words">{{ currentRenderError.stack }}</UiPre>
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
    <CodeChangesCompare ref="codeChangesCompareRef" />
</template>
