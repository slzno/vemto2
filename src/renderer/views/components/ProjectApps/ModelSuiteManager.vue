<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Factory from '@Common/models/Factory'
    import ModelSuite from '@Common/models/ModelSuite'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const showingModal = ref(false),
        selectedModelId = ref(null),
        selectedModel = ref(null),
        factoryName = ref('')

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

        factoryName.value = Factory.getNameFromModel(model)
    }

    watch(selectedModelId, modelChanged)

    const save = () => {
        const factory = new Factory()
        factory.name = factoryName.value
        factory.projectId = projectStore.project.id
        factory.modelId = selectedModel.value.id
        factory.namespace = 'Database\\Factories'
        factory.save()

        const modelSuite = new ModelSuite()
        modelSuite.name = selectedModel.value.name
        modelSuite.modelId = selectedModel.value.id
        modelSuite.projectId = projectStore.project.id
        modelSuite.factoryId = factory.id
        modelSuite.save()

        close()
    }
</script>

<template>
    <div>
        <UiButton @click="show()">Add Model Suite</UiButton>

        <UiModal
            title="Add Model Suite"
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

            <section>
                <h2>Files</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>Factory</td>
                            <td>
                                <UiText v-model="factoryName" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click=" save()">Save</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>