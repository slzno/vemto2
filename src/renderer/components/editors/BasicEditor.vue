<script setup lang="ts">
    import { ref, defineProps, onMounted, computed, defineEmits, defineExpose } from "vue"
    import * as monaco from "monaco-editor"
    import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
    import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
    import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
    import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
    import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

    let editor = null

    const props = defineProps({
        modelValue: {
            type: String,
            required: true,
        },
    })

    const editorElement = ref(null),
        emit = defineEmits(["update:modelValue", "change"]),
        localValue = computed({
            get(): any {
                return props.modelValue
            },
            
            set(value: any): void {
                emit('update:modelValue', value)
            },
        })

    onMounted(async () => {
        createEditor()
    })

    const setValue = (value: string) => {
        editor.setValue(value)
    }

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
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#091023",
            },
        } as monaco.editor.IStandaloneThemeData

        monaco.editor.defineTheme("vemto-dark", theme)

        editor = monaco.editor.create(editorElement.value, {
            value: localValue.value,
            language: "php",
            automaticLayout: true,
            minimap: {
                enabled: false,
            },
            theme: "vemto-dark",
            fontSize: 16,
        })

        editor.getModel()?.onDidChangeContent(() => {
            localValue.value = editor.getValue()
            emit("change", localValue.value)
        })
    }

    defineExpose({
        setValue,
    })
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
