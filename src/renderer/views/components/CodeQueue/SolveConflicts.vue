<script setup lang="ts">
    import { ref, toRef } from 'vue'
    import Main from '@Renderer/services/wrappers/Main'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import RenderableFile, { RenderableFileStatus } from '@Common/models/RenderableFile'
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

    const diffContainer = ref(null)

    // get props, including file that is a RenderableFile
    const props = defineProps<{
        file: RenderableFile
    }>()

    const file = toRef(props, 'file'),
        conflicts = ref([])

    const show = () => {
        showingModal.value = true

        readConflicts()
    }

    const close = () => {
        showingModal.value = false
    }

    const readConflicts = async () => {
        const conflictsJsonData = await Main.API.readConflictsFile(file.value.conflictFileName),
            conflictsData = JSON.parse(conflictsJsonData)

        // if there is no conflicts, save the file and close the modal
        if (conflictsData.conflicts.length === 0) {
            file.value.conflictFileName = null
            file.value.status = RenderableFileStatus.RENDERED
            file.value.save()

            close()

            return
        }

        conflicts.value = conflictsData.conflicts

        const firstConflict = conflictsData.conflicts[0]

        const diff = createTwoFilesPatch('01', '02', firstConflict.currentContent, firstConflict.newContent)

        const html = Diff2Html(diff, {
            // inputFormat: 'diff',
            outputFormat: 'side-by-side',
            matching: 'lines',
            drawFileList: false,
            // showFiles: false,
            matchingMaxComparisons: 10000,
        })

        diffContainer.value.innerHTML = html
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
                    first_code: conflicts.value[0].currentContent,
                    second_code: conflicts.value[0].newContent,
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
        const conflictId = conflicts.value[0].id

        try {
            await Main.API.solveConflictReplacingCode(file.value.id, conflictId, resultCode.value)

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
        resultCode.value = conflicts.value[0].newContent

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
        width="calc(100vw - 100px)"
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
            
            <div class="border border-slate-700 rounded" ref="diffContainer"></div>
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