<script setup lang="ts">
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Crud from '@Common/models/crud/Crud'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import CrudLogic from './components/ProjectCrud/CrudLogic.vue'
    import CrudForm from './components/ProjectCrud/Form/CrudForm.vue'
    import CrudValidation from './components/ProjectCrud/Validation/CrudValidation.vue'
    import UiEmptyMessage from '@Renderer/components/ui/UiEmptyMessage.vue'

    const projectStore = useProjectStore()

    // get crudId from route params
    const route = useRoute(),
        crudId = route.params.crudId,
        crud = ref(null)

    const selectedTab = ref("form")

    const tabs = [
        { label: "Inputs", value: "form" },
        { label: "Validation", value: "validation" },
        { label: "Code", value: "logic" },
        { label: "Data Table", value: "datatable" },
        { label: "Settings", value: "settings" },
    ]

    onMounted(async () => {
        crud.value = Crud.find(crudId)
    })
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div v-if="crud">
            <div class="p-2 font-bold">Edit {{ crud.getLabel() }} CRUD</div>

            <UiTabs 
                :name="projectStore.project.getTabNameFor(`crud${crud.id}`)" 
                :tabs="tabs" 
                v-model="selectedTab" 
            />

            <section v-if="selectedTab === 'form'">
                <CrudForm :crud="crud" />
            </section>

            <section class="flex flex-col w-full h-screen space-y-4 mt-2 px-2" v-if="selectedTab === 'validation'">
                <CrudValidation :crud="crud" />
            </section>

            <section v-if="selectedTab === 'logic'">
                <CrudLogic :crud="crud" />
            </section>

            <section v-if="selectedTab === 'datatable'">
                <UiEmptyMessage>
                    Under Development... Coming Soon!
                </UiEmptyMessage>
            </section>

            <section class="flex flex-col w-full h-screen space-y-4 mt-2 px-2 pb-40 overflow-scroll" v-if="selectedTab === 'settings'">
                <div>
                    <UiSelect v-model="crud.sectionId" label="Section" @change="crud.save()" >
                        <option :value="null" disabled>Select a section</option>
                        <option v-for="section in projectStore.project.appSections" :value="section.id" :key="section.id">{{ section.name }}</option>
                    </UiSelect>
                </div>

                <div>
                    <UiText v-model="crud.name" label="Name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.plural" label="Plural" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.settings.itemName" label="Item Name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.settings.collectionName" label="Collection Name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.settings.itemTitle" label="Item Title" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.settings.collectionTitle" label="Collection Title" @input="crud.save()" />
                </div>

                <div>
                    <UiSelect v-model="crud.defaultSearchColumnId" label="Default search column" @change="crud.save()" >
                        <option :value="null" disabled>Select a column</option>
                        <option v-for="column in crud.model.table.columns" :value="column.id" :key="column.id">{{ column.name }}</option>
                    </UiSelect>
                </div>

                <div>
                    <UiSelect v-model="crud.defaultSortColumnId" label="Default sort column" @change="crud.save()" >
                        <option :value="null" disabled>Select a column</option>
                        <option v-for="column in crud.model.table.columns" :value="column.id" :key="column.id">{{ column.name }}</option>
                    </UiSelect>
                </div>

                <div>
                    <UiSelect v-model="crud.defaultSortDirection" label="Default sort direction" @change="crud.save()" >
                        <option :value="null" disabled>Select a direction</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </UiSelect>
                </div>

                
                <b>Livewire specific</b>

                <div>
                    <UiText v-model="crud.livewireNamespace" label="Namespace" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.livewireIndexComponentName" label="Index Component name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.livewireShowComponentName" label="Show Component name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.livewireCreateComponentName" label="Create Component name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.livewireEditComponentName" label="Edit Component name" @input="crud.save()" />
                </div>
            </section>
        </div>
    </div>
</template>
