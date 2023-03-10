<script setup lang="ts">
    import { toRef, ref, Ref, onMounted, nextTick } from "vue"
    import Column from "@Common/models/Column"
    import TableColumn from "./TableColumn.vue"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"

    const props = defineProps(["table"]),
        table = toRef(props, "table")

    const columns = ref([]) as Ref<Column[]>

    function addColumn() {
        const newColumn = new Column({
            tableId: table.value.id
        }).saveFromInterface()

        columns.value.push(newColumn)

        nextTick(() => {
            const newColumnInput = document.getElementById(`table-column-${newColumn.id}`)

            if(newColumnInput) newColumnInput.focus()
        })
    }

    onMounted(() => {
        columns.value = table.value.getColumns()
    })
</script>

<template>
    <div>
        <section class="space-y-2">
            <TableColumn
                v-for="column in columns"
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
