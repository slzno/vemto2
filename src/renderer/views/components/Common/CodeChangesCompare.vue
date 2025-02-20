<script setup lang="ts">
import { ref, defineExpose, nextTick } from 'vue'
import UiModal from '@Renderer/components/ui/UiModal.vue'
import UiButton from '@Renderer/components/ui/UiButton.vue'
import { createTwoFilesPatch } from 'diff'
import { html as Diff2Html } from 'diff2html'

const showingModal = ref(false),
    title = ref(''),
    firstCode = ref(''),
    firstCodeTitle = ref(''),
    secondCode = ref(''),
    secondCodeTitle = ref(''),
    onConfirm = ref<() => void | null>(null)

const diffViewerContainer = ref(null)

const show = ({ 
    title: modalTitle, 
    firstCode: firstCodeContent, 
    firstCodeTitle: firstCodeTitleContent,
    secondCode: secondCodeContent, 
    secondCodeTitle: secondCodeTitleContent,
    onConfirm: confirmCallback 
}) => {
    title.value = modalTitle
    firstCode.value = firstCodeContent
    firstCodeTitle.value = firstCodeTitleContent
    secondCode.value = secondCodeContent
    secondCodeTitle.value = secondCodeTitleContent
    onConfirm.value = confirmCallback
    showingModal.value = true

    nextTick(() => {
        const diff = createTwoFilesPatch('Original', 'Custom', firstCode.value, secondCode.value)
        const html = Diff2Html(diff, {
            outputFormat: 'side-by-side',
            matching: 'lines',
            drawFileList: false,
            matchingMaxComparisons: 10000,
        })
        diffViewerContainer.value.innerHTML = html
    })
}

const close = () => {
    showingModal.value = false
}

const confirm = () => {
    if (onConfirm.value) onConfirm.value()
    close()
}

defineExpose({
    show,
    close,
})
</script>

<template>
    <UiModal
        :title="title"
        :show="showingModal"
        @close="close()"
        width="calc(100vw - 50px)"
        height="calc(100vh - 50px)"
    >
        <section class="p-4 space-y-2">
            <div class="flex justify-between">
                <div class="w-1/2 font-thin text-left text-white">{{ firstCodeTitle }}</div>
                <div class="w-1/2 font-thin text-left text-white">{{ secondCodeTitle }}</div>
            </div>

            <div ref="diffViewerContainer" id="diffViewerContainer" class="border border-slate-700 rounded overflow-y-auto" style="height: calc(100vh - 210px)"></div>
        </section>

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="confirm">
                    Confirm
                </UiButton>
            </div>
        </template>
    </UiModal>
</template>
