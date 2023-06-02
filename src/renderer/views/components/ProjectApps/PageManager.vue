<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Page from '@Common/models/page/Page'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const showingModal = ref(false),
        pageName = ref('')

    const projectStore = useProjectStore()

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
    }

    const save = () => {
        Page.createFromData({
            name: pageName.value,
        })

        close()
    }
</script>

<template>
    <div>
        <UiButton @click="show()">Add Page</UiButton>

        <UiModal
            title="Add Page"
            :show="showingModal"
            @close="close()"
            width="calc(100vw - 100px)"
        >
            <UiText v-model="pageName" label="Page Name" />

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click=" save()">Save</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>