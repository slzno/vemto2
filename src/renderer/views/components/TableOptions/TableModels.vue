<script setup lang="ts">
    import Model from "@Common/models/Model"
    import TableModel from "./TableModel.vue"
    import { PropType, toRef, reactive, watch } from "vue"
    import Table from "@Common/models/Table"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"
    import CreateDefaultTableModel from "@Common/models/services/tables/CreateDefaultTableModel"

    const props = defineProps({
            table: {
                type: Table as PropType<Table>,
                required: true,
            },
        })

    const table = toRef(props, "table"),
        allTableModels = reactive(table.value.getModels())
    
    watch(table, () => {
        allTableModels.splice(0, allTableModels.length, ...table.value.getModels())
    })

    const addModel = (): void => {
        if(!table.value.getModels().length) {
            allTableModels.push(CreateDefaultTableModel.setTable(table.value).create())
            return
        }

        const model = new Model({
            tableId: table.value.id,
            projectId: table.value.project.id,
            namespace: "App\\Models",
            hasGuarded: true,
            guarded: []
        })

        model.saveFromInterface()

        allTableModels.push(model)
    }

    const removeModel = (model: Model): void => {
        allTableModels.splice(allTableModels.indexOf(model), 1)
    }
</script>

<template>
    <div>
        <section class="space-y-2">
            <TableModel
                v-for="model in allTableModels"
                @removeModel="removeModel(model)"
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
