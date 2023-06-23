<script setup lang="ts">
    import { sentenceCase } from "change-case"
    import Main from "@Renderer/services/wrappers/Main"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import RenderableFile, {
        RenderableFileStatus,
    } from "@Common/models/RenderableFile"
    import Alert from "@Renderer/components/utils/Alert"
    import SolveConflicts from "./components/CodeQueue/SolveConflicts.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { TrashIcon } from "@heroicons/vue/24/outline"
    import SequentialGenerator from "@Renderer/codegen/sequential/SequentialGenerator"
    import TemplateErrorViewer from "./components/Common/TemplateErrorViewer.vue"
    import { computed, ref } from "vue"

    const projectStore = useProjectStore(),
        search = ref("")

    const runSequentialGenerator = async () => {
        await new SequentialGenerator().run(projectStore.project)
    }

    const filteredFiles = computed(() => {
        if(!projectStore.project || !projectStore.project.renderableFiles) return []

        return projectStore.project.renderableFiles.filter((file) => {
            return file
                .getRelativeFilePath()
                .toLowerCase()
                .includes(search.value.toLowerCase())
        })
    })

    const openFile = (file: RenderableFile): void => {
        if (file.wasRemoved()) {
            Alert.warning("This file was removed from the project")
            return
        }

        Main.API.openProjectFile(file.getRelativeFilePath())
    }
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll p-4"
    >
        <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
            <div>
                <!-- Search -->
                <div class="flex items-center">
                    <input
                        v-model="search"
                        type="text"
                        class="border-0 bg-slate-100 dark:bg-slate-850 px-4 py-1 rounded-md"
                        placeholder="Search files..."
                    />
                </div>
            </div>

            <UiButton @click="runSequentialGenerator()">Generate</UiButton>
        </div>

        <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="flex flex-col bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 w-full rounded-lg mb-2 p-2 px-2"
        >
            <div class="flex items-center justify-between">
                <div class="flex cursor-pointer" @click="openFile(file)">
                    <div class="w-24">
                        <div
                            class="inline-block p-1 rounded-md bg-slate-800 mr-2"
                        >
                            <div class="flex items-center space-x-1 text-xs">
                                <div
                                    class="rounded-full w-3 h-3"
                                    :class="{
                                        'bg-green-500':
                                            file.status ===
                                            RenderableFileStatus.RENDERED,
                                        'bg-yellow-500':
                                            file.status ===
                                            RenderableFileStatus.PENDING,
                                        'bg-red-500':
                                            file.status ===
                                            RenderableFileStatus.ERROR,
                                        'bg-orange-500':
                                            file.status ===
                                            RenderableFileStatus.CONFLICT,
                                        'bg-red-700':
                                            file.status ===
                                            RenderableFileStatus.ASK_TO_REMOVE,
                                        'bg-red-800':
                                            file.status ===
                                            RenderableFileStatus.CAN_REMOVE,
                                        'bg-gray-500':
                                            file.status ===
                                            RenderableFileStatus.REMOVED,
                                    }"
                                ></div>
                                <div>{{ sentenceCase(file.status) }}</div>
                            </div>
                        </div>
                    </div>
                    <div
                        :class="{
                            'line-through':
                                file.status === RenderableFileStatus.REMOVED,
                        }"
                        class="italic hover:text-red-500 dark:hover:text-red-400"
                    >
                        {{ file.getRelativeFilePath() }}
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <SolveConflicts
                        v-if="file.status === RenderableFileStatus.CONFLICT"
                        :file="file"
                    />

                    <UiButton @click="file.delete()">
                        <TrashIcon class="w-4 h-4 mr-1 text-red-500" />
                        Clear
                    </UiButton>
                </div>
            </div>

            <div
                class="text-sm mt-2"
                v-if="file.status === RenderableFileStatus.ERROR"
            >
                <div v-if="file.hasTemplateError">
                    <TemplateErrorViewer
                        :errorMessage="file.error"
                        :template="file.template"
                        :errorLine="file.templateErrorLine"
                    />
                </div>

                <div
                    class="text-red-400 bg-slate-100 dark:bg-slate-950 rounded-lg p-4"
                    v-else
                >
                    {{ file.error }}
                </div>
            </div>
        </div>
    </div>
</template>
