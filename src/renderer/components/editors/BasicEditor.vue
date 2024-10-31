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
        language: {
            type: String,
            default: 'php',
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

    const refreshValue = () => {
        editor.setValue(localValue.value)
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

        if (props.language === 'vemtl') {
            monaco.languages.register({ id: 'vemtl' })
            monaco.languages.setLanguageConfiguration('vemtl', {
                autoClosingPairs: [
                    { open: '<%', close: '%>' },
                    { open: '<$', close: '$>' },
                    { open: '<#', close: '#>' },
                    { open: '<up', close: 'up>' },
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '"', close: '"' },
                    { open: "'", close: "'" },
                ],
            })
            monaco.languages.setMonarchTokensProvider('vemtl', {
                defaultToken: '',
                tokenPostfix: '.html',
                ignoreCase: false,
                brackets: [
                    { open: '{', close: '}', token: 'delimiter.curly' },
                    { open: '[', close: ']', token: 'delimiter.square' },
                    { open: '(', close: ')', token: 'delimiter.parenthesis' },
                ],
                tokenizer: {
                    root: [
                        [/<#/, 'comment', '@comment'],
                        [/<\*/, 'comment', '@mode'],
                        [/<\$/, 'variable', '@variable'],
                        [/<%/, 'string', '@string'],
                        [/<up/, 'string', '@string'],
                        [/<import/, 'string', '@import'],
                    ],
                    comment: [
                        [/#>/, 'comment', '@pop'],
                        [/./, 'comment.content'],
                    ],
                    mode: [
                        [/\*>/, 'comment', '@pop'],
                        [/./, 'comment.content'],
                    ],
                    variable: [
                        [/\$>/, 'variable', '@pop'],
                        [/./, 'variable.content'],
                    ],
                    string: [
                        [/%>/, 'string', '@pop'],
                        [/up>/, 'string', '@pop'],
                        [/./, 'string.content'],
                    ],
                    import: [
                        [/>/, 'string', '@pop'],
                        [/./, 'string.content'],
                    ],
                },
            })
        }

        editor = monaco.editor.create(editorElement.value, {
            value: localValue.value,
            language: props.language,
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
        refreshValue,
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
