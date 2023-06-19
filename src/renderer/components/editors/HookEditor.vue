<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"

    import * as monaco from 'monaco-editor'
    import { constrainedEditor } from "constrained-editor-plugin"
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

    const props = defineProps({
        content: {
            type: String,
            required: true,
        },

        hooks: {
            type: Object,
            required: true,
        },
    })

    const editorElement = ref(null),
        content = toRef(props, "content") as Ref<string>,
        hooks = toRef(props, "hooks") as Ref<any>

    let initialHookLines = [],
        editor = null

    onMounted(async () => {
        initialHookLines = getHookLinesNumbers(content.value)

        self.MonacoEnvironment = {
            getWorker(_, label) {
                if (label === 'json') return new jsonWorker()
                if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
                if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
                if (label === 'typescript' || label === 'javascript') return new tsWorker()
                
                return new editorWorker()
            }
        }

        console.log(content.value)

        editor = monaco.editor.create(editorElement.value, {
            value: content.value,
            language: 'php',
            minimap: {
                enabled: false
            },
            theme: 'vs-dark',
        })

        const model = editor.getModel()

        const constrainedInstance = constrainedEditor(monaco)
        constrainedInstance.initializeIn(editor)

        let ranges = []
        const hookRanges = getHookRanges(content.value)

        hookRanges.forEach((range, index) => {
            ranges.push({
                range: range,
                label: 'hook' + index,
                allowMultiline: true,
            })
        })

        constrainedInstance.addRestrictionsTo(model, ranges)
        
        model.toggleHighlightOfEditableAreas()

        console.log(model.getValueInEditableRanges())
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

    const getNonHookLinesNumbers = (content: string) => {
        const hookLines = getHookLinesNumbers(content),
            lines = content.split("\n")

        let nonHookLines = []

        lines.forEach((line, index) => {
            if (!hookLines.includes(index + 1)) {
                nonHookLines.push(index + 1)
            }
        })

        return nonHookLines
    }

    const getHookLinesNumbers = (content: string) => {
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

    const getHookRanges = (content: string) => {
        let lines = content.split("\n"),
            hookRanges = []

        lines.forEach((line, index) => {
            if (line.includes("// hook:")) {
                hookRanges.push([index + 1, 1, index + 1, line.length + 1])
            }
        })

        return hookRanges
    }
</script>

<template>
    <div
        class="overflow-y-auto"
        style="height: calc(100% - 150px)"
        ref="editorElement"
        id="editorElement"
    ></div>
</template>

<style>
.editableArea--multi-line {
    background-color: #2d3748;
}
</style>