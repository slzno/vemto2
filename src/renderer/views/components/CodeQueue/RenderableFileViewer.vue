<script setup lang="ts">
    import RenderableFile, {
        RenderableFileStatus,
    } from "@Common/models/RenderableFile"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import { sentenceCase } from "change-case"
    import { ref, Ref, defineProps } from "vue"
    import TemplateErrorViewer from "../Common/TemplateErrorViewer.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { CodeBracketIcon, DocumentMinusIcon, MinusCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import ConflictsSolver from "./ConflictsSolver.vue"
    import InternalFiles from "@Renderer/util/InternalFiles"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"

    const props = defineProps<{
        file: RenderableFile
    }>()

    const conflictsSolver = ref(null),
        currentConflictsFile = ref(null) as Ref<RenderableFile>,
        conflictsFilePath = ref(""),
        conflictsFileContent = ref(""),
        conflictsNewFileContent = ref("")

    const showConflictsSolver = async (file: RenderableFile): Promise<void> => {
        currentConflictsFile.value = file
        conflictsFilePath.value = file.getRelativeFilePath()
        conflictsFileContent.value = await Main.API.readProjectFile(conflictsFilePath.value)
        conflictsNewFileContent.value = await InternalFiles.readGeneratedFile(conflictsFilePath.value)
        
        conflictsSolver.value.show()
    }

    const openFile = (file: RenderableFile): void => {
        if (file.wasRemoved()) {
            Alert.warning("This file was removed from the project")
            return
        }

        Main.API.openProjectFile(file.getRelativeFilePath())
    }

    const conflictsSolved = async (content) => {
        if (!conflictsFilePath.value) {
            return
        }
        
        await Main.API.writeProjectFile(conflictsFilePath.value, content)


        currentConflictsFile.value.solveConflicts()

        conflictsFilePath.value = ""
        conflictsFileContent.value = ""
        conflictsNewFileContent.value = ""

        Alert.success("Conflicts solved successfully")
    }

    const ignoreFile = async (file: RenderableFile) => {
        file.setAsIgnored()
    }

    const clearFile = async (file: RenderableFile) => {
        file.setAsIdle()
    }
</script>

<template>
    <ConflictsSolver 
        can-ignore
        :ref="`conflictsSolver`"
        :relativeFilePath="conflictsFilePath"
        :currentFileContent="conflictsFileContent"
        :newFileContent="conflictsNewFileContent"
        @solved="conflictsSolved"
        @ignored="ignoreFile(currentConflictsFile)"
    />

    <div
        v-if="file && file.id"
        class="flex flex-col justify-center bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 w-full min-h-[3.5rem] rounded-lg mb-2 p-2 px-2"
    >
        <div class="flex items-center justify-between">
            <div class="flex cursor-pointer" @click="openFile(file)">
                <div class="w-24">
                    <div 
                        class="inline-block py-1 px-1.5 rounded-md bg-slate-750 border border-slate-700 mr-2"
                        :class="{
                            'text-green-500':
                                file.status ===
                                RenderableFileStatus.RENDERED,
                            'text-yellow-500':
                                file.status ===
                                RenderableFileStatus.PENDING,
                            'text-red-500':
                                file.status ===
                                RenderableFileStatus.ERROR,
                            'text-orange-500':
                                file.status ===
                                RenderableFileStatus.CONFLICT,
                            'text-red-700':
                                file.status ===
                                RenderableFileStatus.ASK_TO_REMOVE,
                            'text-red-800':
                                file.status ===
                                RenderableFileStatus.CAN_REMOVE,
                            'text-slate-450':
                                file.status ===
                                RenderableFileStatus.REMOVED || file.status === RenderableFileStatus.IGNORED,
                        }"
                    >
                        <div class="flex items-center space-x-1.5 text-xs">
                            <div
                                class="rounded-full w-2.5 h-2.5 bg-current"
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
                    class="font-thin hover:text-red-500 dark:hover:text-red-400"
                >
                    {{ file.getRelativeFilePath() }}
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <UiButton
                    v-show="file.status === RenderableFileStatus.CONFLICT"
                    class="flex items-center justify-between"
                    @click="showConflictsSolver(file)"
                >
                    <CodeBracketIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                    Solve Conflicts
                </UiButton>

                <!-- <UiButton @click="file.delete()">
                    <TrashIcon class="w-4 h-4 mr-1 text-red-500" />
                    Clear
                </UiButton> -->

                <UiOptionsDropdown>
                    <UiDropdownItem @click="ignoreFile(file)">
                        <MinusCircleIcon class="w-4 h-4 mr-1 text-red-500" />
                        Ignore
                    </UiDropdownItem>

                    <UiDropdownItem @click="clearFile(file)">
                        <DocumentMinusIcon class="w-4 h-4 mr-1 text-red-500" />
                        Clear Status
                    </UiDropdownItem>
                </UiOptionsDropdown>
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
