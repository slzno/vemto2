<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireIndexComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"
    import RenderableLivewireEditComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent"

    // CodeMirror
    import {indentWithTab} from "@codemirror/commands"
    import { EditorState, Transaction } from "@codemirror/state"
    import { EditorView, basicSetup } from "codemirror"
    import {keymap} from "@codemirror/view"
    import { php as phpLang } from "@codemirror/lang-php"
    import readOnlyRangesExtension, {preventModifyTargetRanges, smartPaste, smartDelete} from "codemirror-readonly-ranges"
    import { oneDark } from "@codemirror/theme-one-dark"

    const props = defineProps({
        crud: {
            type: Object as PropType<Crud>,
            required: true,
        },
    })

    const crud = toRef(props, "crud") as Ref<Crud>,
        createComponentEditor = ref(null),
        createComponentContent = ref(""),
        editComponentContent = ref(""),
        selectedTab = ref("createComponent")
        
    let initialHookLines = []

    const tabs = [
        { label: "Create Component", value: "createComponent" },
        { label: "Edit Component", value: "editComponent" },
    ]

    onMounted(async () => {
        createComponentContent.value =
            await new RenderableLivewireCreateComponent(crud.value).compile()
        editComponentContent.value = await new RenderableLivewireEditComponent(
            crud.value
        ).compile()

        initialHookLines = getHookLines(createComponentContent.value)

        const simpleExtension = () => {
            let currentLine = null,
                previousLine = null

            return EditorState.changeFilter.of((tr:Transaction) => {
                previousLine = currentLine
                // console.log(tr.startState.doc.toString())

                // console log current line
                currentLine = tr.state.doc.lineAt(tr.state.selection.main.head).number
                    
                // console.log(previousLine, currentLine)

                const currentLineContent = tr.state.doc.lineAt(tr.state.selection.main.head).text

                console.log(previousLine, currentLine, currentLineContent)

                if(currentLineContent.includes("// hook:")) {
                    // console.log("hook line")

                    // change line opacity to 75%
                    

                    return true
                }

                return false
            })
        }

        const simpleTransactionFilterExtension = () => {
            return EditorState.transactionFilter.of((tr:Transaction) => {
                console.log(tr.state.doc.lineAt(tr.state.selection.main.head).text)
                return tr
            })
        }

        const simpleEventHandlers = () => {
            return EditorView.domEventHandlers({
                keyup: (event, view) => {
                    // log current line
                    console.log(view.state.doc.lineAt(view.state.selection.main.head).text)

                    console.log(event)

                    // if is tab, stop propagation
                    if(event.key === "Tab") {
                        console.log('tab')
                        event.stopPropagation()
                    }
                }
            })
        }

        let startState = EditorState.create({
            doc: createComponentContent.value,
            extensions: [
                oneDark,
                basicSetup,
                keymap.of([indentWithTab]),
                simpleEventHandlers(),
                // simpleExtension(),
                // simpleTransactionFilterExtension(),
                readOnlyRangesExtension(getReadOnlyRanges),
                // preventModifyTargetRanges(getReadOnlyRanges),
                // smartDelete(getReadOnlyRanges),
                phpLang(),
            ],
        })

        let view = new EditorView({
            state: startState,
            parent: createComponentEditor.value
        })

        EditorView.domEventHandlers({
            keyup: (event) => {
                console.log(event)
            }
        })
    })

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

    const getReadOnlyRanges = (
        targetState: EditorState
    ): Array<{ from: number | undefined; to: number | undefined }> => {
        const hookLines = initialHookLines,
            lastestHookLine = hookLines[hookLines.length - 1],
            lastestLine = targetState.doc.lines

        let ranges = []

        hookLines.forEach((line, index) => {
            const previousHookLine = hookLines[index - 1] ?? undefined,
                previousLine = line === 1 ? undefined : line - 1

            if (index === 0) {
                ranges.push({ 
                    from: 0, 
                    to: previousLine ? targetState.doc.line(previousLine).to : undefined
                })
            } else {
                ranges.push({
                    from: previousHookLine ? targetState.doc.line(previousHookLine).to : undefined,
                    to: previousLine ? targetState.doc.line(previousLine).to : undefined
                })
            }
        })

        if (lastestHookLine < lastestLine) {
            ranges.push({
                from: lastestHookLine ? targetState.doc.line(lastestHookLine).to : undefined,
                to: undefined
            })
        }

        return ranges
    }
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
