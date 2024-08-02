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

    type TemplateDataType = "MODEL" | "JSON" | "STRING" | "RENDERABLE"

    interface TemplateDataItem {
        name: string
        type: TemplateDataType
        value: any
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
        const data: TemplateData = {}

        const regex = /<# DATA:(\w+) \[ (\w+) = (.+) \] #>/g
        let match: RegExpExecArray | null

        while ((match = regex.exec(content)) !== null) {
            const type = match[1] as TemplateDataType
            const name = match[2]

            let value = match[3]

            if(type === "JSON") {
                value = JSON.parse(value)
            }

            data[name] = {
                name,
                type,
                value,
            }
        }

        return data
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
        class="h-screen overflow-y-auto pb-48 flex p-2"
    >
        <div class="w-1/5 h-full">
            <div id="templates-tree"></div>
        </div>

        <div class="w-2/5 h-full">
            <BasicEditor ref="templateEditor" v-model="templateContent" />
        </div>

        <div class="w-2/5 h-full">
            <BasicEditor v-model="renderedContent" />
        </div>
    </div>
</template>
