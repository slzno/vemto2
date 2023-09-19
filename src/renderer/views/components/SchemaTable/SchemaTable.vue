<script setup lang="ts">
    import { nextTick, ref, toRef } from "vue"
    import Table from "@Common/models/Table"
    import TableModel from "./TableModel.vue"
    import TableColumn from "./TableColumn.vue"
    import { ArrowUturnDownIcon, ExclamationCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"

    const props = defineProps(["table"]),
        table = toRef(props, "table"),
        confirmDeleteDialog = ref(null),
        schemaStore = useSchemaStore()

    let clickedQuickly = false,
        isRemoving = false

    const removeTable = async () => {
        isRemoving = true
        setTimeout(() => isRemoving = false, 500)

        const confirmed = await confirmDeleteDialog.value.confirm()
        if(!confirmed) return

        nextTick(() => {
            table.value.remove()
        })
    }

    const undoRemoveTable = (): void => {
        isRemoving = true
        setTimeout(() => isRemoving = false, 500)

        table.value.undoRemove()
    }

    const getTablePosition = (table: Table) => {
        return {
            left: (table.positionX || 0) + "px",
            top: (table.positionY || 0) + "px",
        }
    }

    const startClick = () => {
        clickedQuickly = true

        setTimeout(() => {
            clickedQuickly = false
        }, 250)
    }

    const endClick = () => {
        if (!clickedQuickly) {
            return
        }

        setTimeout(() => {
            if(isRemoving) return

            schemaStore.selectTable(table.value)
        }, 1);
    }
</script>

<template>
    <UiConfirm ref="confirmDeleteDialog">
        Are you sure you want to delete the <span class="text-red-400">{{ table.name }}</span> table?
    </UiConfirm>

    <div
        @mousedown="startClick()"
        @mouseup="endClick()"
        :id="`table_${table.id}`"
        :ref="`table_${table.id}`"
        :data-table-id="table.id"
        :class="{
            'border border-transparent': schemaStore.selectedTableIsNot(table),
            'border dark:border-slate-500': schemaStore.selectedTableIs(table),
        }"
        class="cursor-move schema-table group absolute shadow-lg rounded-lg hover:border-slate-500 bg-white dark:bg-slate-850 z-10 space-y-4 pb-4"
        style="min-width: 270px"
        :style="{
            top: getTablePosition(table).top,
            left: getTablePosition(table).left,
        }"
    >
        <div class="w-full dark:bg-slate-800 rounded-t-lg px-4 pt-2 pb-2 flex justify-between items-center">
            <span class="title w-full font-bold text-lg dark:text-slate-300 flex items-center space-x-1">
                <div class="flex items-center" :class="{
                    'line-through': table.isRemoved(),
                }">
                    <div title="The table will be removed after saving the migration" v-show="table.isRemoved()">
                        <ExclamationCircleIcon
                            class="w-5 h-5 text-red-500 mr-2"/>
                    </div>
                    {{ table.name }}
                </div>
                <div class="text-sm font-normal text-slate-500" v-if="table.isNew()">
                    (Draft)
                </div>
                <div title="The table will be removed after saving the migration" class="text-sm font-normal text-slate-500" v-if="table.isRemoved()">
                    (Removed)
                </div>
            </span>
            <TrashIcon
                v-show="!table.isRemoved()"
                title="Remove table"
                class="w-5 h-5 group-hover:visible invisible cursor-pointer text-slate-400 hover:text-red-500"
                @click.stop.prevent="removeTable()" />
            <ArrowUturnDownIcon
                v-show="table.isRemoved()"
                title="Undo remove table"
                class="w-5 h-5 group-hover:visible invisible cursor-pointer text-slate-400 hover:text-red-500"
                @click.stop.prevent="undoRemoveTable()" />
        </div>

        <div
            :class="{
                'opacity-30': table.isRemoved(),
            }" 
            class="font-mono px-4">
            <TableColumn
                v-for="column in table.getOrderedColumns()"
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
