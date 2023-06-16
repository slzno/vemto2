<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireIndexComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"
    import RenderableLivewireEditComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent"

    // CodeMirror
    import { indentWithTab } from "@codemirror/commands"
    import { EditorState, Transaction } from "@codemirror/state"
    import { EditorView, basicSetup } from "codemirror"
    import {
        keymap,
        Decoration,
        ViewPlugin,
        ViewUpdate,
        DecorationSet,
        MatchDecorator,
    } from "@codemirror/view"
    import { php as phpLang } from "@codemirror/lang-php"
    import readOnlyRangesExtension, {
        preventModifyTargetRanges,
        smartPaste,
        smartDelete,
    } from "codemirror-readonly-ranges"
    import { oneDark } from "@codemirror/theme-one-dark"

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
        startState = null,
        view = null

    const tabs = [
        { label: "Create Component", value: "createComponent" },
        { label: "Edit Component", value: "editComponent" },
    ]

    onMounted(async () => {
        createComponentContent = await new RenderableLivewireCreateComponent(
            crud.value
        ).compile()
        editComponentContent.value = await new RenderableLivewireEditComponent(
            crud.value
        ).compile()

        initialHookLines = getHookLines(createComponentContent)

        startState = createEditorState(
            replaceHookLinesWithNoContent(createComponentContent)
        )

        view = new EditorView({
            state: startState,
            parent: createComponentEditor.value,
        })
    })

    const createEditorState = (content: string) => {
        const simpleExtension = () => {
            let currentLine = null,
                previousLine = null

            return EditorState.changeFilter.of((tr: Transaction) => {
                previousLine = currentLine
                // console.log(tr.startState.doc.toString())

                // console log current line
                currentLine = tr.state.doc.lineAt(
                    tr.state.selection.main.head
                ).number

                // console.log(previousLine, currentLine)

                const currentLineContent = tr.state.doc.lineAt(
                    tr.state.selection.main.head
                ).text

                console.log(previousLine, currentLine, currentLineContent)

                if (currentLineContent.includes("// hook:")) {
                    // console.log("hook line")

                    // change line opacity to 75%

                    return true
                }

                return false
            })
        }

        const simpleTransactionFilterExtension = () => {
            return EditorState.transactionFilter.of((tr: Transaction) => {
                console.log(
                    tr.state.doc.lineAt(tr.state.selection.main.head).text
                )
                return tr
            })
        }

        const simpleEventHandlers = () => {
            return EditorView.domEventHandlers({
                keyup: (event, view) => {
                    const currentLine = view.state.doc.lineAt(
                        view.state.selection.main.head
                    ).number
                    // log current line
                    // console.log(view.state.doc.lineAt(view.state.selection.main.head).text)

                    // console.log(event)

                    // if is tab, stop propagation
                    if (event.key === "Enter") {
                        console.log(currentLine)
                        const currentLineIsHookLine =
                            initialHookLines.includes(currentLine)

                        // duplicate the line on createComponentContent if it is a hook line
                        if (currentLineIsHookLine) {
                            const contentLines =
                                    createComponentContent.split("\n"),
                                currentLineContent =
                                    contentLines[currentLine - 1],
                                currentLineIndentation =
                                    currentLineContent.match(/^\s+/)

                            let newLineContent = ""

                            // console.log(currentLineContent, currentLineIndentation)

                            // add a new line
                            newLineContent += "\n"

                            // add indentation
                            // newLineContent += currentLineIndentation ? currentLineIndentation[0] : ""

                            // add the hook comment
                            newLineContent += currentLineContent

                            // insert new line content after the current line on createComponentContent
                            createComponentContent =
                                createComponentContent.replace(
                                    currentLineContent,
                                    currentLineContent + newLineContent
                                )

                            // update the hook lines (inser after the current line)
                            initialHookLines = getHookLines(
                                createComponentContent
                            )

                            // add a new line to the editor
                            view.dispatch({
                                changes: {
                                    from: view.state.selection.main.head,
                                    insert: "\n",
                                },
                            })
                        }
                    }
                },
            })
        }

        // simple extension that adds opacity to the lines that are not hook lines
        const addOpacityToNonHookLines = () => {
            const allLines = getLineNumbers(content),
                nonHookLines = getNonHookLines(createComponentContent),
                hookLines = getHookLines(createComponentContent)

            const createDecorations = (view) => {
                let decorations = []

                const isHookLine = (lineNumber) => {
                    return hookLines.includes(lineNumber)
                }

                for (let lineNumber of allLines) {
                    let line = view.state.doc.line(lineNumber);
                    
                    if (!isHookLine(lineNumber)) {
                        decorations.push(Decoration.line({class: "opacity-75 cursor-not-allowed readonly"}).range(line.from, line.from));
                    } else {
                        decorations.push(Decoration.line({class: "bg-slate-900"}).range(line.from, line.from));
                    }
                }

                return Decoration.set(decorations)
            }

            return ViewPlugin.define(
                (view) => ({
                    decorations: createDecorations(view),
                }),
                {
                    decorations: (view) => view.decorations,
                }
            )
        }

        return EditorState.create({
            doc: content,
            extensions: [
                oneDark,
                basicSetup,
                keymap.of([indentWithTab]),
                simpleEventHandlers(),
                // simpleExtension(),
                // simpleTransactionFilterExtension(),
                // readOnlyRangesExtension(getReadOnlyRanges),
                addOpacityToNonHookLines(),
                // preventModifyTargetRanges(getReadOnlyRanges),
                // smartDelete(getReadOnlyRanges),
                phpLang(),
            ],
        })
    }

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
                    to: previousLine
                        ? targetState.doc.line(previousLine).to
                        : undefined,
                })
            } else {
                ranges.push({
                    from: previousHookLine
                        ? targetState.doc.line(previousHookLine).to
                        : undefined,
                    to: previousLine
                        ? targetState.doc.line(previousLine).to
                        : undefined,
                })
            }
        })

        if (lastestHookLine < lastestLine) {
            ranges.push({
                from: lastestHookLine
                    ? targetState.doc.line(lastestHookLine).to
                    : undefined,
                to: undefined,
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
