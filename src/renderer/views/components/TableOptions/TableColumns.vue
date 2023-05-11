<script setup lang="ts">
    import { toRef, ref, Ref, onMounted, nextTick } from "vue"
    import Column from "@Common/models/Column"
    import TableColumn from "./TableColumn.vue"
    import Draggable from "vuedraggable"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"

    const props = defineProps(["table"]),
        table = toRef(props, "table")

    const columns = ref([]) as Ref<Column[]>

    const addColumn = () => {
        const newColumn = new Column({
            tableId: table.value.id
        }).saveFromInterface()

        columns.value.push(newColumn)

        nextTick(() => {
            const newColumnInput = document.getElementById(`table-column-${newColumn.id}`)

            if(newColumnInput) newColumnInput.focus()
        })
    }

    const saveColumnsOrder = () => {
        columns.value.forEach((column, index) => {
            column.order = index
            column.saveFromInterface()
        })
    }

    const clearInvalidColumns = () => {
        columns.value = columns.value.filter(column => {
            if(column.isInvalid()) column.remove()

            return column.isValid()
        })
    }
    
    // temporary code
    const removeColumn = (column: Column) => {
        columns.value.splice(columns.value.indexOf(column), 1)
    }

    onMounted(() => {
        columns.value = table.value.getOrderedColumns()
    })
</script>

<template>
    <section @keyup.esc="clearInvalidColumns">
        <Draggable
            class="space-y-2"
            :list="columns"
            item-key="columns-draggable"
            @end="saveColumnsOrder"
        >
            <template #item="{ element }">
                <TableColumn @removeColumn="removeColumn(element)" :column="element" />
            </template>
        </Draggable>
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
</template>
<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}
</style>
