<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Page from '@Common/models/page/Page'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const showingModal = ref(false),
        pageName = ref(''),
        pageRoute = ref('')

    const projectStore = useProjectStore()

    watch(pageName, () => {
        pageRoute.value = Page.calculateDefaultRoutePath(pageName.value)
    })

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
    }

    const save = () => {
        Page.createFromData({
            name: pageName.value,
            route: pageRoute.value,
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

            <UiText v-model="pageRoute" label="Page Route" />

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click=" save()">Save</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>