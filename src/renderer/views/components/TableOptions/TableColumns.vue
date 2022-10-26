<script setup lang="ts">
    import { PropType, toRef } from "vue"
    import Column from "@Common/models/Column"
    import TableColumn from "./TableColumn.vue"

    const props = defineProps({
        columns: {
            type: Array as PropType<Column[]>,
            required: true,
        },
    })

    const columns = toRef(props, "columns")
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

        <section></section>
    </div>
</template>
