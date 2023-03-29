<script setup lang="ts">
    import { ref } from 'vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'

    const showingModal = ref(false)

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
    }
</script>

<template>
    <div>
        <UiButton @click="show()">Add CRUD</UiButton>

        <UiModal
            title="Add Model Suite"
            :show="showingModal"
            @close="close()"
            width="calc(100vw - 100px)"
        >
            asdasdasdasdasd

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton>Save</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>