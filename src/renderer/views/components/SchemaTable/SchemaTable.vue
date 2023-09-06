<script setup lang="ts">
    import { nextTick, ref, toRef, defineEmits } from "vue"
    import Table from "@Common/models/Table"
    import TableModel from "./TableModel.vue"
    import TableColumn from "./TableColumn.vue"
    import TableOptions from "../TableOptions/TableOptions.vue"
    import { ArrowUturnDownIcon, ExclamationCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import Main from "@Renderer/services/wrappers/Main"

    const props = defineProps(["table"]),
        table = toRef(props, "table"),
        showingOptions = ref(false),
        selected = ref(false),
        emit = defineEmits(['tableRemoved'])

    let clickedQuickly = false,
        isRemoving = false

    const removeTable = (): void => {
        isRemoving = true
        setTimeout(() => isRemoving = false, 500)

        Main.API.confirm("Are you sure you want to delete this table?").then((confirmed) => {
            if (!confirmed) return

            showingOptions.value = false
            selected.value = false

            nextTick(() => {
                table.value.remove()
            })
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
        }, 300)
    }

    const endClick = () => {
        if (!clickedQuickly) {
            return
        }

        setTimeout(() => {
            if(isRemoving) return
            
            selected.value = true
            showingOptions.value = true
        }, 50);
    }

    const tableOptionsClosed = () => {
        selected.value = false
        showingOptions.value = false
    }
</script>

<template>
    <TableOptions ref="tableOptionsWindow" :table="table" :show="showingOptions && table" @close="tableOptionsClosed()" />

    <div
        @mousedown="startClick()"
        @mouseup="endClick()"
        :id="`table_${table.id}`"
        :ref="`table_${table.id}`"
        :data-table-id="table.id"
        :class="{
            'border border-transparent': !selected,
            'border dark:border-slate-500': selected,
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
