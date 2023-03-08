<script setup lang="ts">
    import { ref, toRef } from 'vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import RenderableFile from '@Common/models/RenderableFile'
    import UiButton from '@Renderer/components/ui/UiButton.vue'

    const showingModal = ref(false)

    // get props, including file that is a RenderableFile
    const props = defineProps<{
        file: RenderableFile
    }>()

    const file = toRef(props, 'file')

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
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
            {{ file.conflictFileName }}
        </section>

        <template #footer>
            <div class="flex justify-end p-4">
                <!-- <UiButton @click="saveMigrations">Save</UiButton> -->
            </div>
        </template>
    </UiModal>
</template>