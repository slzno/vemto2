<script setup lang="ts">
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Crud from '@Common/models/crud/Crud'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import CrudLogic from './components/ProjectCrud/Logic/CrudLogic.vue'
    import CrudForm from './components/ProjectCrud/Form/CrudForm.vue'
    import CrudSettings from './components/ProjectCrud/Settings/CrudSettings.vue'
    import CrudValidation from './components/ProjectCrud/Validation/CrudValidation.vue'
    import UiEmptyMessage from '@Renderer/components/ui/UiEmptyMessage.vue'
    import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

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
        v-if="projectStore.projectIsReady"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div v-if="crud">
            <div class="flex items-center px-4 space-x-2">
                <ChevronLeftIcon class="w-6 h-6 text-slate-500 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer" @click="$router.back()" />

                <div class="py-4 font-thin text-lg flex space-x-2">
                    <span>Edit {{ crud.getLabel() }}</span>
                    <span v-if="crud.isDetail()" class="text-xs rounded bg-slate-950 border border-slate-700 px-2 py-1 flex items-center">
                        Detail Component
                    </span>
                </div>
            </div>

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
