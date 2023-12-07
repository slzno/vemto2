<script setup lang="ts">
    import { ref, defineProps, onMounted, toRef, Ref, defineEmits } from "vue"
    import * as monaco from "monaco-editor"
    import { BuiltinTheme } from "monaco-editor"
    import { constrainedEditor } from "constrained-editor-plugin"
    import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
    import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
    import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
    import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
    import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

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

    const emit = defineEmits(["hooksUpdated"])

    const editorElement = ref(null),
        content = toRef(props, "content") as Ref<string>,
        hooks = toRef(props, "hooks") as Ref<any>

    let editor = null

    onMounted(async () => {
        editor = createEditor()

        const model = editor.getModel()

        const constrainedInstance = constrainedEditor(monaco)
        constrainedInstance.initializeIn(editor)

        let ranges = []
        const hookRanges = getHookRanges(content.value)

        console.log(content.value)

        hookRanges.forEach((range) => {
            ranges.push({
                range: range.range,
                label: range.name,
                allowMultiline: true,
            })
        })

        constrainedInstance.addRestrictionsTo(model, ranges)

        const starterRanges = {}

        hookRanges.forEach((range, index) => {
            const savedHook = hooks.value[range.name]

            starterRanges[range.name] = savedHook || range.indentation
        })

        model.updateValueInEditableRanges(starterRanges)

        highlightEditableLines(model)

        model.onDidChangeContentInEditableRange((changedContent) => {
            Object.keys(changedContent).forEach((hookName) => {
                hooks.value[hookName] = changedContent[hookName]
            })

            emit("hooksUpdated", hooks.value)

            highlightEditableLines(model)
        })
    })

    const createEditor = () => {
        self.MonacoEnvironment = {
            getWorker(_, label) {
                if (label === "json") return new jsonWorker()
                if (label === "css" || label === "scss" || label === "less")
                    return new cssWorker()
                if (
                    label === "html" ||
                    label === "handlebars" ||
                    label === "razor"
                )
                    return new htmlWorker()
                if (label === "typescript" || label === "javascript")
                    return new tsWorker()

                return new editorWorker()
            },
        }

        const theme = {
            base: "vs-dark" as BuiltinTheme,
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#0f172a",
            },
        }

        monaco.editor.defineTheme("vemto-dark", theme)

        return monaco.editor.create(editorElement.value, {
            value: content.value,
            language: "php",
            automaticLayout: true,
            minimap: {
                enabled: false,
            },
            theme: "vemto-dark",
            fontSize: 16,
        })
    }

    const highlightEditableLines = (model: any) => {
        const editableLines = getEditableLines(model)

        editableLines.forEach((line) => {
            editor.deltaDecorations([], [
                { range: new monaco.Range(line, 1, line, 1), options: { isWholeLine: true, className: 'bg-slate-800' } }
            ])
        })
    }

    const getEditableLines = (model: any) => {
        const editableRanges = model.getCurrentEditableRanges()
        
        let editableLines = []

        Object.keys(editableRanges).forEach((key) => {
            const range = editableRanges[key].range

            for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
                editableLines.push(i)
            }
        })

        return editableLines
    }

    const getHookRanges = (content: string) => {
        let lines = content.split("\n"),
            hookRanges = []

        lines.forEach((line, index) => {
            if (line.includes("// hook:")) {
                const hookName = line.replace("// hook:", "").trim(),
                    indentations = line.match(/^\s+/)

                hookRanges.push({
                    name: hookName,
                    range: [index + 1, 1, index + 1, line.length + 1],
                    indentation: indentations ? indentations[0] : "",
                })
            }
        })

        return hookRanges
    }
</script>

<template>
    <div
        class="overflow-y-auto w-full h-full"
        ref="editorElement"
        id="editorElement"
    ></div>
</template>

<style>
    .editableArea--multi-line {
        background-color: #2d3748;
    }
</style>
