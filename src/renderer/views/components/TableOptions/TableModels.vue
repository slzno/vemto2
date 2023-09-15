<script setup lang="ts">
    import Model from "@Common/models/Model"
    import TableModel from "./TableModel.vue"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"
    import CreateDefaultTableModel from "@Common/models/services/tables/CreateDefaultTableModel"

    const schemaStore = useSchemaStore()


    const addModel = (): void => {
        if(!schemaStore.selectedTable.getModels().length) {
            CreateDefaultTableModel.setTable(schemaStore.selectedTable).create()
            return
        }

        const model = new Model({
            tableId: schemaStore.selectedTable.id,
            projectId: schemaStore.selectedTable.project.id,
            namespace: "App\\Models",
            hasGuarded: true,
            guarded: []
        })

        model.saveFromInterface()
    }
</script>

<template>
    <div>
        <section class="space-y-2">
            <TableModel
                v-for="model in schemaStore.selectedTable.getModels()"
                :key="model.id"
                :model="model"
            />
        </section>

        <section
            class="mt-4 flex w-full justify-center text-slate-400 hover:text-red-500 cursor-pointer text-lg"
        >
            <div class="flex items-center" @click="addModel()">
                <PlusCircleIcon class="w-8 h-8" />
                <span class="px-1.5">Add model</span>
            </div>
        </section>
    </div>
</template>
