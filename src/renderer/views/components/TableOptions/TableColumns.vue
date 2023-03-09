<script setup lang="ts">
    import { toRef } from "vue"
    import Column from "@Common/models/Column"
    import TableColumn from "./TableColumn.vue"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"

    const props = defineProps(["table"]),
        table = toRef(props, "table")

    function addColumn() {
        if(!table.value) return

        const newColumn = new Column({
            tableId: table.value.id
        }).saveFromInterface()

        table.value.columns.push(newColumn)
    }
</script>

<template>
    <div>
        <section class="space-y-2">
            <TableColumn
                v-for="column in table.getColumns()"
                :key="column.id"
                :column="column"
            />
        </section>

        <section
            class="mt-4 flex w-full justify-center text-slate-400 hover:text-red-500 cursor-pointer text-lg"
            @click="addColumn"
        >
            <div class="flex items-center">
                <PlusCircleIcon class="w-8 h-8" />
                <span class="px-1.5">Add column</span>
            </div>
        </section>
    </div>
</template>
