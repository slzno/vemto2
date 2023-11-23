<script setup lang="ts">
    import { ref, defineProps, onMounted, toRef, Ref, defineEmits } from "vue"
    import * as monaco from "monaco-editor"
    import { BuiltinTheme } from "monaco-editor"
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

        modelValue: {
            type: String,
            required: true,
        },
    })

    const editorElement = ref(null),
        content = toRef(props, "content") as Ref<string>,
        emit = defineEmits(["update:modelValue", "change"])

    onMounted(async () => {
        createEditor()
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

        const editor = monaco.editor.create(editorElement.value, {
            value: content.value,
            language: "php",
            automaticLayout: true,
            minimap: {
                enabled: false,
            },
            theme: "vemto-dark",
        })

        editor.getModel()?.onDidChangeContent(() => {
            emit("update:modelValue", editor.getValue())
        })
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
