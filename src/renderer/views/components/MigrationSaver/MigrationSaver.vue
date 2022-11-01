<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { ref } from "vue"

    const projectStore = useProjectStore(),
        showingModal = ref(false)
</script>

<template>
    <div
        class="absolute bottom-0 left-0 p-4"
        v-if="projectStore.project.hasUpdatedTables()"
    >
        <UiButton class="flex items-center justify-between" @click="showingModal = true">
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Save
        </UiButton>

        <UiModal title="Review Migrations" :show="showingModal" @close="showingModal = false">
            
            <section class="p-4">
                
            </section>

            <template #footer>
                <div class="flex justify-end p-4">
                    <UiButton
                        @click="showingModal = false"
                        >Save</UiButton
                    >
                </div>
            </template>
        </UiModal>
    </div>
</template>
