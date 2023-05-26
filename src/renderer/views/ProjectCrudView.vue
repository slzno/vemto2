<script setup lang="ts">
    // import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Crud from '@Common/models/crud/Crud'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import HandleProjectDatabase from '@Renderer/services/HandleProjectDatabase'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
import UiText from '@Renderer/components/ui/UiText.vue'

    // const projectStore = useProjectStore()

    // get crudId from route params
    const route = useRoute(),
        crudId = route.params.crudId,
        crud = ref(null)

    const selectedTab = ref("form")

    const tabs = [
        { label: "Form", value: "form" },
        { label: "Data Table", value: "datatable" },
        { label: "Validation", value: "validation" },
        { label: "Logic", value: "logic" },
        { label: "Settings", value: "settings" },
    ]

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => {
            crud.value = Crud.find(crudId)

            console.log(crud.value.panels)
        })
    })
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div v-if="crud">
            <div class="p-2 font-bold">Edit {{ crud.getLabel() }} CRUD</div>

            <UiTabs :tabs="tabs" v-model="selectedTab" :external="true" />

            <section class="flex w-full h-screen space-x-4 mt-2 px-2" v-if="selectedTab === 'form'">
                <div class="space-y-2">
                    <UiButton class="w-full">Add Text Input</UiButton>
                </div>

                <div class="flex-grow bg-slate-950 p-2 rounded-lg">
                    <!-- crud.panels as panel div -->
                    <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="panel in crud.panels" :key="panel.id">
                        <h1 class="font-bold text-lg text-slate-500 mb-4">{{ panel.title }}</h1>

                        <div class="space-y-1">
                            <div class="p-1 border border-dotted rounded border-transparent hover:border-slate-700 cursor-pointer" v-for="input in panel.inputs" :key="panel.id">
                                {{ input.label }}
                                <input
                                    class="w-full dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="flex flex-col w-full h-screen space-y-4 mt-2 px-2" v-if="selectedTab === 'validation'">
                <div>
                    <table>
                        <tr>
                            <th></th>
                            <th>Creation Validation</th>
                            <th>Update Validation</th>
                        </tr>

                        <tr v-for="input in crud.inputs" :key="input.id">
                            <td>{{ input.name }}</td>
                            <td>
                                {{ input.creationRules }}
                            </td>
                            <td>
                                {{ input.updateRules }}
                            </td>
                        </tr>
                    </table>
                </div>
            </section>

            <section class="flex flex-col w-full h-screen space-y-4 mt-2 px-2 pb-40 overflow-scroll" v-if="selectedTab === 'settings'">
                <div>
                    <UiText v-model="crud.section" label="Section" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.name" label="Item Name" @input="crud.save()" />
                </div>

                <div>
                    <UiText v-model="crud.plural" label="Collection Name" @input="crud.save()" />
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
