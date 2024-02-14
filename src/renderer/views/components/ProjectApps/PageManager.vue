<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Page from '@Common/models/page/Page'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import { PlusIcon } from '@heroicons/vue/24/outline'

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
        <UiButton @click="show()">
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Page
        </UiButton>

        <UiModal
            title="Add Page"
            :show="showingModal"
            @close="close()"
            width="700px"
        >
            <div class="p-4 space-y-4">
                <UiText v-model="pageName" label="Page Name" />
    
                <UiText v-model="pageRoute" label="Page Route" />
            </div>

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click=" save()">Create</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>