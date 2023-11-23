<script setup lang="ts">
    import RenderableFile, {
        RenderableFileStatus,
    } from "@Common/models/RenderableFile"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import { sentenceCase } from "change-case"
    import { ref, toRef, defineProps } from "vue"
    import TemplateErrorViewer from "../Common/TemplateErrorViewer.vue"
    import SolveConflicts from "./SolveConflicts.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
import { TrashIcon } from "@heroicons/vue/24/outline"

    const props = defineProps<{
        file: RenderableFile
    }>()

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
        class="flex flex-col bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 w-full rounded-lg mb-2 p-2 px-2"
    >
        <div class="flex items-center justify-between">
            <div class="flex cursor-pointer" @click="openFile(file)">
                <div class="w-24">
                    <div class="inline-block p-1 rounded-md bg-slate-800 mr-2">
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
                    :errorStack="file.errorStack"
                    :template="file.template"
                    :errorLine="file.templateErrorLine"
                />
            </div>

            <pre
                v-text="file.error"
                class="overflow-hidden whitespace-pre-wrap text-red-400 bg-slate-100 dark:bg-slate-950 rounded-lg p-4"
                v-else
            ></pre>
        </div>
    </div>
</template>
