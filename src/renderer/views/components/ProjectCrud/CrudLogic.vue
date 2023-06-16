<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireIndexComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"
    import RenderableLivewireEditComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent"

    import * as monaco from 'monaco-editor'
    import { constrainedEditor } from "constrained-editor-plugin"
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

    const props = defineProps({
        crud: {
            type: Object as PropType<Crud>,
            required: true,
        },
    })

    const crud = toRef(props, "crud") as Ref<Crud>,
        createComponentEditor = ref(null),
        editComponentContent = ref(""),
        selectedTab = ref("createComponent")

    let initialHookLines = [],
        createComponentContent = "",
        editor = null

    const tabs = [
        { label: "Create Component", value: "createComponent" },
        { label: "Edit Component", value: "editComponent" },
    ]

    onMounted(async () => {
        createComponentContent = await new RenderableLivewireCreateComponent(
            crud.value
        ).compile()

        initialHookLines = getHookLines(createComponentContent)

        self.MonacoEnvironment = {
            createTrustedTypesPolicy(policyName, policyOptions) { return undefined },
            getWorker(_, label) {
                if (label === 'json') return new jsonWorker()
                if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
                if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
                if (label === 'typescript' || label === 'javascript') return new tsWorker()
                
                return new editorWorker()
            }
        }

        editor = monaco.editor.create(document.getElementById('createComponentEditor'), {
            value: "function hello() {\ncontent\n}",
            language: 'javascript',
            minimap: {
                enabled: false
            },
        })

        const model = editor.getModel()

        const constrainedInstance = constrainedEditor(monaco);
        constrainedInstance.initializeIn(editor);
        constrainedInstance.addRestrictionsTo(model, [{
            range: [2, 1, 2, 8], // Range of Util Variable name
            label: 'functionBody',
            allowMultiline: true,
        }]);
    })

    const replaceHookLinesWithNoContent = (content: string) => {
        let lines = content.split("\n")

        lines.forEach((line, index) => {
            if (line.includes("// hook:")) {
                // preserve the spaces before the hook comment
                const spaces = line.match(/^\s+/)
                lines[index] = spaces ? spaces[0] + "" : ""
            }
        })

        return lines.join("\n")
    }

    const getNonHookLines = (content: string) => {
        const hookLines = getHookLines(content),
            lines = content.split("\n")

        let nonHookLines = []

        lines.forEach((line, index) => {
            if (!hookLines.includes(index + 1)) {
                nonHookLines.push(index + 1)
            }
        })

        return nonHookLines
    }

    const getHookLines = (content: string) => {
        let lines = content.split("\n"),
            hookLines = []

        lines.forEach((line, index) => {
            if (line.includes("// hook:")) {
                hookLines.push(index + 1)
            }
        })

        return hookLines
    }

    const getLineNumbers = (content: string) => {
        let lines = content.split("\n"),
            lineNumbers = []

        lines.forEach((line, index) => {
            lineNumbers.push(index + 1)
        })

        return lineNumbers
    }

    // const getReadOnlyRanges = (): Array<{ from: number | undefined; to: number | undefined }> => {
    //     const hookLines = initialHookLines,
    //         lastestHookLine = hookLines[hookLines.length - 1],
    //         lastestLine = targetState.doc.lines

    //     let ranges = []

    //     hookLines.forEach((line, index) => {
    //         const previousHookLine = hookLines[index - 1] ?? undefined,
    //             previousLine = line === 1 ? undefined : line - 1

    //         if (index === 0) {
    //             ranges.push({
    //                 from: 0,
    //                 to: previousLine
    //                     ? targetState.doc.line(previousLine).to
    //                     : undefined,
    //             })
    //         } else {
    //             ranges.push({
    //                 from: previousHookLine
    //                     ? targetState.doc.line(previousHookLine).to
    //                     : undefined,
    //                 to: previousLine
    //                     ? targetState.doc.line(previousLine).to
    //                     : undefined,
    //             })
    //         }
    //     })

    //     if (lastestHookLine < lastestLine) {
    //         ranges.push({
    //             from: lastestHookLine
    //                 ? targetState.doc.line(lastestHookLine).to
    //                 : undefined,
    //             to: undefined,
    //         })
    //     }

    //     return ranges
    // }
</script>

<template>
    <div class="mt-2">
        <UiTabs :tabs="tabs" v-model="selectedTab" :external="true" />

        <div
            v-show="selectedTab === 'createComponent'"
            class="flex flex-col w-full h-screen space-y-4 mt-2 px-2"
        >
            <div
                class="overflow-y-auto font-mono text-lg"
                style="height: calc(100% - 150px)"
                ref="createComponentEditor"
                id="createComponentEditor"
            ></div>
            
        </div>

        <div
            v-show="selectedTab === 'editComponent'"
            class="flex flex-col w-full h-screen space-y-4 mt-2 px-2"
        >
            <textarea
                v-model="editComponentContent"
                class="bg-slate-900"
                cols="30"
                rows="30"
            ></textarea>
        </div>
    </div>
</template>
