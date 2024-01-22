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
    import CrudSettings from './components/ProjectCrud/Settings/CrudSettings.vue'
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

            <section v-if="selectedTab === 'settings'">
                <CrudSettings :crud="crud" />
            </section>
        </div>
    </div>
</template>
