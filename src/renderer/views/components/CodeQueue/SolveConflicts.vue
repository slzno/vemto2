<script setup lang="ts">
    import { ref, toRef } from 'vue'
    import Main from '@Renderer/services/wrappers/Main'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import RenderableFile from '@Common/models/RenderableFile'
    import UiButton from '@Renderer/components/ui/UiButton.vue'

    import { createTwoFilesPatch } from 'diff'
    import { html as Diff2Html } from 'diff2html'

    const showingModal = ref(false)

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

        conflicts.value = conflictsData.conflicts

        const firstConflict = conflictsData.conflicts[0]

        const diff = createTwoFilesPatch('01', '02', firstConflict.currentContent, firstConflict.newContent)

        console.log(diff)

        const html = Diff2Html(diff, {
            // inputFormat: 'diff',
            outputFormat: 'side-by-side',
            matching: 'lines',
            drawFileList: false,
            // showFiles: false,
            matchingMaxComparisons: 10000,
        })

        // set html to diffContainer by ref
        console.log(diffContainer)
        diffContainer.value.innerHTML = html
    }
</script>

<template>
    <UiButton
        class="flex items-center justify-between"
        @click="show()"
    >
        <!-- <ArrowDownTrayIcon class="w-4 h-4 mr-2" /> -->
        Solve Conflicts
    </UiButton>

    <UiModal
        title="Solve Conflicts"
        :show="showingModal"
        @close="close()"
        width="calc(100vw - 100px)"
    >
        <section class="p-4 space-y-4">
            <div class="flex justify-end space-x-1.5">
                <UiButton>Merge with AI</UiButton>
                <UiButton>Overwrite</UiButton>
            </div>
            
            <div ref="diffContainer"></div>
        </section>

        <template #footer>
            <div class="flex justify-end p-4">
                <!-- <UiButton @click="saveMigrations">Save</UiButton> -->
            </div>
        </template>
    </UiModal>
</template>