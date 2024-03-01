<script setup lang="ts">
    import { ref, toRef, nextTick, Ref, defineEmits, defineExpose } from 'vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiLoading from '@Renderer/components/ui/UiLoading.vue'
    import MergeIcon from '@Renderer/components/icons/MergeIcon.vue'

    import InternalFiles from '@Renderer/util/InternalFiles'

    import { createTwoFilesPatch } from 'diff'
    import { html as Diff2Html } from 'diff2html'
    import { ArrowDownTrayIcon, CheckCircleIcon, CodeBracketIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'
    import BasicEditor from '@Renderer/components/editors/BasicEditor.vue'
    import Main from '@Renderer/services/wrappers/Main'
    import UiConfirm from '@Renderer/components/ui/UiConfirm.vue'
    import UiWarning from '@Renderer/components/ui/UiWarning.vue'
import LicenseHandler from '@Renderer/services/LicenseHandler'
import Alert from '@Renderer/components/utils/Alert'

    const showingModal = ref(false),
        showingResultModal = ref(false),
        showingEditorModal = ref(false),
        calculatingMerge = ref(false),
        calculatingAIMerge = ref(false),
        resultCode = ref('') as Ref<string>,
        confirmOverwriteDialog = ref(null),
        confirmIgnoreDialog = ref(null)

    const diffViewerContainer = ref(null)

    // get props, including file that is a RenderableFile
    const emit = defineEmits(["solved", "ignored"]), 
        props = defineProps({
            relativeFilePath: {
                type: String,
                required: true,
            },

            currentFileContent: {
                type: String,
                required: true,
            },

            newFileContent: {
                type: String,
                required: true,
            },

            canIgnore: {
                type: Boolean,
                required: false,
            }
        })

    const relativeFilePath = toRef(props, 'relativeFilePath'), 
        currentFileContent = toRef(props, 'currentFileContent'),
        newFileContent = toRef(props, 'newFileContent')

    const show = async () => {
        calculatingAIMerge.value = false
        showingModal.value = true

        await nextTick()

        readConflicts()
    }

    const close = () => {
        showingModal.value = false
    }

    defineExpose({
        show,
        close,
    })

    const readConflicts = () => {
        const diff = createTwoFilesPatch('01', '02', currentFileContent.value, newFileContent.value)

        const html = Diff2Html(diff, {
            outputFormat: 'side-by-side',
            matching: 'lines',
            drawFileList: false,
            matchingMaxComparisons: 10000,
        })

        diffViewerContainer.value.innerHTML = html
    }

    const mergeCode = async () => {
        calculatingMerge.value = true

        await InternalFiles.writeGeneratedFile(relativeFilePath.value, newFileContent.value)

        const mergedFile = await Main.API.mergePHPFile(relativeFilePath.value)

        const resultingFile = await Main.API.readProjectFile(mergedFile.file.relativePath)

        resultCode.value = resultingFile

        showResultModal()

        calculatingMerge.value = false
    }

    const mergeCodeWithAI = async () => {
        if(!window.licenseIsActive()) {
            window.showLicenseModal("Please activate your license to use AI features.")
            return
        }

        const confirmed = await window.aiConfirm()
        if(!confirmed) return

        const licenseHandler = new LicenseHandler(),
            licenseData = licenseHandler.getLicense()

        try {
            calculatingAIMerge.value = true

            const response = await fetch('http://localhost:8000/api/v2/php/merge', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_code: currentFileContent.value,
                    second_code: newFileContent.value,
                    license_email: licenseData.email,
                    license_code: licenseData.code,
                }),
            }).then(async (response) => { 
                const responseData: any = await response.json()

                console.log(responseData)

                if(!response.ok) Alert.error(responseData.message || "Error")

                return responseData 
            }).catch(error => {
                Alert.error(error.message)
                calculatingAIMerge.value = false
            })

            resultCode.value = response.result

            calculatingAIMerge.value = false

            if(resultCode.value) {
                showResultModal()
            }
        } catch (error) {
            console.error(error)
            calculatingAIMerge.value = false
        }
    }

    const solveConflict = async () => {
        try {
            solveConflictWithContent(resultCode.value)
        } catch (error) {
            console.error(error)
        }
    }

    const solveConflictWithContent = async (content) => {
        closeResultModal()
        closeEditorModal()
        close()
        
        emit('solved', content)
    }

    const showResultModal = () => {
        showingResultModal.value = true
    }

    const closeResultModal = () => {
        showingResultModal.value = false
    }

    const solveManually = () => {
        resultCode.value = newFileContent.value

        showEditorModal()
    }

    const showEditorModal = () => {
        showingEditorModal.value = true
    }

    const closeEditorModal = () => {
        showingEditorModal.value = false
    }

    const overwriteFile = async () => {
        const confirmed = await confirmOverwriteDialog.value.confirm()
        if(!confirmed) return

        solveConflictWithContent(newFileContent.value)
    }

    const ignoreFile = async () => {
        const confirmed = await confirmIgnoreDialog.value.confirm()
        if(!confirmed) return

        emit('ignored')
    }
</script>

<template>
    <UiConfirm ref="confirmOverwriteDialog" title="Confirm Code">
        Are you sure you want to accept the <span class="text-red-500 dark:text-red-400">generated code</span>?
    </UiConfirm>

    <UiConfirm ref="confirmIgnoreDialog" title="Ignore file">
        Are you sure you want to ignore this file?
        <UiWarning class="mt-2">
            All future changes to this file will be ignored (you can undo this behavior in the Ignored Files screen)
        </UiWarning>
    </UiConfirm>

    <UiModal
        title="Solve Conflicts"
        :show="showingModal"
        @close="close()"
        width="calc(100vw - 50px)"
        height="calc(100vh - 50px)"
    >
        <section class="p-4 space-y-4">
            <div class="flex justify-between">
                <div class="text-slate-500 italic text-sm">
                    {{ relativeFilePath }}
                </div>
                <div class="flex space-x-2">
                    <UiButton @click="mergeCodeWithAI()">
                        <UiLoading v-if="calculatingAIMerge" class="mr-1 scale-75"></UiLoading>
                        <MergeIcon v-else class="w-4 h-4 mr-1 text-blue-500" />
                        Merge with AI
                    </UiButton>
    
                    <!-- <UiButton title="Merge is currently in Alpha and may have weird results. If you need better results, use Merge with AI" @click="mergeCode()">
                        <UiLoading v-show="calculatingMerge" class="mr-1 scale-75"></UiLoading>
                        <MergeIcon v-show="!calculatingMerge" class="w-4 h-4 mr-1 text-red-500" />
                        Merge&nbsp;<small>(Alpha)</small>
                    </UiButton> -->
    
                    <UiButton @click="solveManually()">
                        <CodeBracketIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                        Solve manually
                    </UiButton>
    
                    <UiButton @click="overwriteFile()">
                        <ArrowDownTrayIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                        Accept Generated
                    </UiButton>
    
                    <UiButton v-if="canIgnore" @click="ignoreFile()">
                        <NoSymbolIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                        Ignore
                    </UiButton>
                </div>
            </div>
            
            <div ref="diffViewerContainer" id="diffViewerContainer" class="border border-slate-700 rounded overflow-y-auto" style="height: calc(100vh - 210px)"></div>
        </section>
    </UiModal>

    <UiModal
        title="Resulting Code"
        :show="showingResultModal"
        @close="closeResultModal()"
        width="calc(100vw - 50px)"
        height="calc(100vh - 50px)"
    >
        <BasicEditor v-model="resultCode" />

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="solveConflict()">
                    <CheckCircleIcon class="w-4 h-4 mr-1 text-green-500" />
                    Accept
                </UiButton>
            </div>
        </template>
    </UiModal>

    <UiModal
        title="Edit Code"
        :show="showingEditorModal"
        @close="closeEditorModal()"
        width="calc(100vw - 50px)"
        height="calc(100vh - 50px)"
    >
        <BasicEditor v-model="resultCode" />

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="solveConflict()">
                    <CheckCircleIcon class="w-4 h-4 mr-1 text-green-500" />
                    Accept
                </UiButton>
            </div>
        </template>
    </UiModal>
</template>