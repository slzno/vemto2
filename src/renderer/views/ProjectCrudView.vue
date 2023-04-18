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

            console.log(crud.value.panels)
        })
    })
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden p-4"
    >
        <div v-if="crud">
            <b>Crud editor: {{ crud.name }}</b>

            <section class="flex w-full h-screen space-x-4 mt-4">
                <div class="space-y-2">
                    <UiButton class="w-full">Add Text Input</UiButton>
                </div>

                <div class="flex-grow bg-slate-950 p-2 rounded-lg">
                    <!-- crud.panels as panel div -->
                    <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="panel in crud.panels" :key="panel.id">
                        <h1 class="font-bold text-lg text-slate-500 mb-4">{{ panel.title }}</h1>

                        <div class="space-y-1">
                            <div class="p-1 border border-dotted rounded border-transparent hover:border-slate-700" v-for="input in panel.inputs" :key="panel.id">
                                {{ input.label }}
                                <input
                                    class="w-full dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg cursor-pointer"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
