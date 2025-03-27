<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Crud, { CrudType } from '@Common/models/crud/Crud'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import { PlusIcon } from '@heroicons/vue/24/outline'
import Alert from '@Renderer/components/utils/Alert'

    const emit = defineEmits(['created'])

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

    const validateAndSave = () => {
        if(!selectedModel.value) {
            Alert.warning("Please select a model.")
            return
        }

        const excludedColumns = [],
            generateDetails = true

        if(selectedModel.value.name.toLowerCase() === 'form') {
            Alert.error("'Form' is a reserved name for Livewire! Please choose another model.")
            return
        }

        Crud.createFromModel(
            selectedModel.value,
            CrudType.LIVEWIRE,
            excludedColumns, 
            generateDetails
        )

        emit('created')

        close()
    }
</script>

<template>
    <div>
        <UiButton @click="show()">
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            CRUD
        </UiButton>

        <UiModal
            title="Add CRUD"
            :show="showingModal"
            @close="close()"
            width="700px"
        >
            <div class="p-4">
                <UiSelect v-model="selectedModelId" label="For Model">
                    <option
                        v-for="model in projectStore.project.models"
                        :key="model.id"
                        :value="model.id"
                    >
                        {{ model.name }}
                    </option>
                </UiSelect>
            </div>

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click=" validateAndSave()">Create</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>