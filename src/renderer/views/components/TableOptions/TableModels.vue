<script setup lang="ts">
    import { PropType, toRef } from "vue"
    import Model from "@Common/models/Model"
    import TableModel from "./TableModel.vue"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"
    import Table from "@Renderer/../common/models/Table"
    import WordManipulator from "@Renderer/../common/util/WordManipulator"
    import TableNameExceptions from "@Renderer/../common/models/static/TableNameExceptions"

    const props = defineProps({
            table: {
                type: Table as PropType<Table>,
                required: true,
            },
        })

    const table = toRef(props, "table")

    const addModel = (): void => {
        const model = new Model({
            tableId: table.value.id,
            projectId: table.value.project.id,
            namespace: "App\\Models",
            hasGuarded: true,
            guarded: []
        })
        
        const modelNameByTableName = WordManipulator.runMultiple(
            ['singularize', 'pascalCase'],
            table.value.name
        )

        if(!table.value.getModels().length) {
            model.name = modelNameByTableName
            model.plural = table.value.name
        }

        model.calculateDataByName()
        model.saveFromInterface()

        table.value.models.push(model)
    }
</script>

<template>
    <div>
        <section class="space-y-2">
            <TableModel
                v-for="model in table.getModels()"
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
