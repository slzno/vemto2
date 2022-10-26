<script setup lang="ts">
    import { ref, toRef } from "vue"
    import Table from "@Common/models/Table"
    import TableModel from "../SchemaTable/TableModel.vue"
    import TableColumn from "../SchemaTable/TableColumn.vue"
    import TableOptions from "../SchemaTable/TableOptions.vue"

    const props = defineProps(["table"]),
        table = toRef(props, "table"),
        showingOptions = ref(false)

    const getTablePosition = (table: Table) => {
        return {
            left: (table.positionX || 0) + "px",
            top: (table.positionY || 0) + "px",
        }
    }
</script>

<template>
    <TableOptions ref="tableOptionsWindow" :table="table" :show="showingOptions" @close="showingOptions = false" />

    <div
        @click="showingOptions = true"
        :id="`table_${table.id}`"
        :ref="`table_${table.id}`"
        :data-table-id="table.id"
        :class="{
            'border border-transparent': table.name !== 'selected',
            'border border-slate-500': table.name === 'selected',
        }"
        class="schema-table cursor-move absolute shadow-lg rounded-lg hover:border-slate-500 bg-white dark:bg-slate-850 z-10 space-y-4 pb-4"
        style="min-width: 270px"
        :style="{
            top: getTablePosition(table).top,
            left: getTablePosition(table).left,
        }"
    >
        <div class="w-full dark:bg-slate-800 rounded-t-lg px-4 pt-2 pb-2">
            <span class="title w-full font-bold text-lg dark:text-slate-300">
                {{ table.name }}
            </span>
        </div>

        <div class="font-mono px-4">
            <TableColumn
                v-for="column in table.columns"
                :key="column.name"
                :column="column"
            />
        </div>

        <div class="font-mono px-4">
            <TableModel
                v-for="model in table.getModels()"
                :key="model.name"
                :model="model"
            />
        </div>
    </div>
</template>
