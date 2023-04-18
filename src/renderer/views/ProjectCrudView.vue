<script setup lang="ts">
    // import { useProjectStore } from '@Renderer/stores/useProjectStore'

    import { onMounted, ref } from 'vue'
    import { useRoute } from 'vue-router'
    import Crud from '@Common/models/crud/Crud'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import HandleProjectDatabase from '@Renderer/services/HandleProjectDatabase'

    // const projectStore = useProjectStore()

    // get crudId from route params
    const route = useRoute(),
        crudId = route.params.crudId,
        crud = ref(null)

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => {
            crud.value = Crud.find(crudId)
        })
    })
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden p-4"
    >
        <div v-if="crud">
            Crud editor: {{ crud.name }}

            <section class="">
                <div>
                    <UiButton>Add Section</UiButton>
                    <UiButton>Add Datatable</UiButton>
                    <UiButton>Add Text Input</UiButton>
                    <UiButton>Add Button</UiButton>
                    <UiButton>Add Hero</UiButton>
                    <UiButton>Add Title</UiButton>
                </div>

                <div>
                    <!-- crud.panels as panel div -->
                    <div v-for="panel in crud.panels" :key="panel.id">
                        Panel: {{ panel.name }}
                        <div v-for="input in panel.inputs" :key="panel.id">
                            
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
