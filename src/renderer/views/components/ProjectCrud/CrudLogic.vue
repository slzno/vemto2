<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireIndexComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"
    import RenderableLivewireEditComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent"

    // CodeMirror
    import { EditorState } from "@codemirror/state"
    import { EditorView, basicSetup } from "codemirror"
    import { php as phpLang } from "@codemirror/lang-php"
    import readOnlyRangesExtension from "codemirror-readonly-ranges"

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

    const tabs = [
        { label: "Create Component", value: "createComponent" },
        { label: "Edit Component", value: "editComponent" },
    ]

    onMounted(async () => {
        console.log(crud.value)

        createComponentContent.value =
            await new RenderableLivewireCreateComponent(crud.value).compile()
        editComponentContent.value = await new RenderableLivewireEditComponent(
            crud.value
        ).compile()

        let startState = EditorState.create({
            doc: createComponentContent.value,
            extensions: [
                basicSetup,
                readOnlyRangesExtension(getReadOnlyRanges),
                phpLang(),
            ],
        })

        let view = new EditorView({
            state: startState,
            parent: createComponentEditor.value,
        })

        console.log(getReadOnlyRanges(startState))
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
        const hookLines = getHookLines(targetState.doc.toString()),
            lastestHookLine = hookLines[hookLines.length - 1],
            lastestLine = targetState.doc.lines

        let ranges = []

        hookLines.forEach((line, index) => {
            const previousHookLine = hookLines[index - 1] ?? undefined,
                nextHookLine = hookLines[index + 1] ?? undefined,
                previousLine = line === 1 ? undefined : line - 1,
                nextLine = line === lastestLine ? undefined : line + 1

            if (index === 0) {
                console.log(previousLine, nextLine, previousHookLine, nextHookLine)
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
                class="bg-white text-slate-900 overflow-y-auto"
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
