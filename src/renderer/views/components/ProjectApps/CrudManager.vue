<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Crud, { CrudType } from '@Common/models/crud/Crud'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const showingModal = ref(false),
        selectedModelId = ref(null),
        selectedModel = ref(null)

    const projectStore = useProjectStore()

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
    }

    const modelChanged = () => {
        const model = projectStore.project.findModelById(selectedModelId.value)

        selectedModel.value = model
    }

    watch(selectedModelId, modelChanged)

    const save = () => {
        const crud = new Crud()
        crud.type = CrudType.DEFAULT
        crud.name = selectedModel.value.name + ' CRUD'
        crud.modelId = selectedModel.value.id
        crud.projectId = projectStore.project.id
        crud.save()

        close()
    }
</script>

<template>
    <div>
        <UiButton @click="show()">Add CRUD</UiButton>

        <UiModal
            title="Add CRUD"
            :show="showingModal"
            @close="close()"
            width="calc(100vw - 100px)"
        >
            <UiSelect v-model="selectedModelId">
                <option
                    v-for="model in projectStore.project.models"
                    :key="model.id"
                    :value="model.id"
                >
                    {{ model.name }}
                </option>
            </UiSelect>

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click=" save()">Save</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>