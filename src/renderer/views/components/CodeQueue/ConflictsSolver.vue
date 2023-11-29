<script setup lang="ts">
    import { ref, toRef, nextTick } from 'vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiLoading from '@Renderer/components/ui/UiLoading.vue'

    import { createTwoFilesPatch } from 'diff'
    import { html as Diff2Html } from 'diff2html'
    import { CodeBracketIcon } from '@heroicons/vue/24/outline'

    const showingModal = ref(false),
        showingResultModal = ref(false),
        showingManualModal = ref(false),
        calculatingMerge = ref(false),
        resultCode = ref('')

    const diffViewerContainer = ref(null)

    // get props, including file that is a RenderableFile
    const props = defineProps<{
        currentFileContent: string,
        newFileContent: string,
    }>()

    const currentFileContent = toRef(props, 'currentFileContent'),
        newFileContent = toRef(props, 'newFileContent')

    const show = async () => {
        showingModal.value = true

        await nextTick()

        readConflicts()
    }

    const close = () => {
        showingModal.value = false
    }

    const readConflicts = () => {
        const diff = createTwoFilesPatch('01', '02', currentFileContent.value, newFileContent.value)

        const html = Diff2Html(diff, {
            // inputFormat: 'diff',
            outputFormat: 'side-by-side',
            matching: 'lines',
            drawFileList: false,
            // showFiles: false,
            matchingMaxComparisons: 10000,
        })

        console.log(diffViewerContainer.value)

        diffViewerContainer.value.innerHTML = html
    }

    const mergeCode = async () => {
        try {
            calculatingMerge.value = true

            const response = await fetch('http://localhost/api/php/merge', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_code: currentFileContent.value,
                    second_code: newFileContent.value,
                }),
            }).then(response => response.json()).catch(() => calculatingMerge.value = false)

            resultCode.value = response.result

            calculatingMerge.value = false

            showResultModal()
        } catch (error) {
            console.error(error)
            calculatingMerge.value = false
        }
    }

    const solveConflict = async () => {
        try {
            // await Main.API.solveConflictReplacingCode(file.value.id, conflictId, resultCode.value)

            closeResultModal()
            closeManualModal()
            
            readConflicts()
        } catch (error) {
            console.error(error)
        }
    }

    const showResultModal = () => {
        showingResultModal.value = true
    }

    const closeResultModal = () => {
        showingResultModal.value = false
    }

    const solveManually = () => {
        resultCode.value = newFileContent.value

        showManualModal()
    }

    const showManualModal = () => {
        showingManualModal.value = true
    }

    const closeManualModal = () => {
        showingManualModal.value = false
    }
</script>

<template>
    <UiButton
        class="flex items-center justify-between"
        @click="show()"
    >
        <CodeBracketIcon class="w-4 h-4 mr-1 text-orange-500" />
        Solve Conflicts
    </UiButton>

    <UiModal
        title="Solve Conflicts"
        :show="showingModal"
        @close="close()"
        width="calc(100vw - 50px)"
        height="calc(100vh - 50px)"
    >
        <section class="p-4 space-y-4">
            <div class="flex justify-end space-x-2">
                <UiButton @click="mergeCode()">
                    <UiLoading v-show="calculatingMerge" class="mr-1 scale-75"></UiLoading>
                    Merge
                </UiButton>

                <UiButton @click="mergeCode()">
                    <UiLoading v-show="calculatingMerge" class="mr-1 scale-75"></UiLoading>
                    Merge with AI
                </UiButton>

                <UiButton @click="solveManually()">
                    Solve manually
                </UiButton>

                <UiButton>Ignore</UiButton>
                
                <UiButton>Overwrite</UiButton>
            </div>
            
            <div ref="diffViewerContainer" id="diffViewerContainer" class="border border-slate-700 rounded overflow-y-auto" style="height: calc(100vh - 210px)"></div>
        </section>
    </UiModal>

    <UiModal
        title="Resulting Code"
        :show="showingResultModal"
        @close="closeResultModal()"
        width="750px"
    >
        <highlightjs language="php" :code="resultCode" />

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="solveConflict()">Save</UiButton>
            </div>
        </template>
    </UiModal>

    <UiModal
        title="Edit Code"
        :show="showingManualModal"
        @close="closeManualModal()"
        width="1000px"
        height="600px"
    >
        <textarea class="w-full bg-slate-900 border-none h-full font-mono" v-model="resultCode" />

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="solveConflict()">Save</UiButton>
            </div>
        </template>
    </UiModal>
</template>