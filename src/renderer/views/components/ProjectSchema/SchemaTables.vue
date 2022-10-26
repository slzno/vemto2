<script setup lang="ts">
    import { toRef } from "vue"
    import SchemaTable from "./SchemaTable.vue"

    const props = defineProps(["tables"]),
        tables = toRef(props, "tables")
</script>

<template>
    <div
        id="tablesContainer"
        class="relative block w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-300 dark:scrollbar-thumb-black dark:scrollbar-track-slate-900"
    >
        <SchemaTable v-for="table in tables" :key="table.id" :table="table" />
    </div>
</template>
