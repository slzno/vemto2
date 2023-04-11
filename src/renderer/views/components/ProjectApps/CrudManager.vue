<script setup lang="ts">
    import { ref, watch } from 'vue'
    import Page from '@Common/models/Page'
    import Crud, { CrudType } from '@Common/models/Crud'
    import Controller from '@Common/models/Controller'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const showingModal = ref(false),
        selectedModelId = ref(null),
        selectedModel = ref(null),
        controllerName = ref(''),
        indexPageName = ref('')

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

        controllerName.value = Controller.getNameFromModel(model)
        indexPageName.value = 'index'
    }

    watch(selectedModelId, modelChanged)

    const save = () => {
        const controller = new Controller()
        controller.name = controllerName.value
        controller.projectId = projectStore.project.id
        controller.modelId = selectedModel.value.id
        controller.namespace = 'App\\Controllers'
        controller.save()

        const indexPage = new Page()
        indexPage.name = indexPageName.value
        indexPage.projectId = projectStore.project.id
        indexPage.save()

        const crud = new Crud()
        crud.type = CrudType.DEFAULT
        crud.name = selectedModel.value.name + ' CRUD'
        crud.modelId = selectedModel.value.id
        crud.projectId = projectStore.project.id
        crud.controllerId = controller.id
        crud.indexPageId = indexPage.id
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
                            <td>Controller</td>
                            <td>
                                <UiText v-model="controllerName" />
                            </td>
                        </tr>
                        <tr>
                            <td>Index Page</td>
                            <td>
                                <UiText v-model="indexPageName" />
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