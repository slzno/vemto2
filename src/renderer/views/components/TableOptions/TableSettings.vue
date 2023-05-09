<script setup lang="ts">
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { defineProps, toRef } from 'vue'
    import debounce from "@Renderer/../common/tools/debounce"

    const props = defineProps(['table']),
        table = toRef(props, 'table')

    const saveTable = debounce(() => {
        table.value.saveFromInterface()
    }, 500)

    const logTable = (table: any) => {
        console.log(table)
    }
</script>
<template>
    <div>
        <section class="space-y-2">
            <UiText v-model="table.name" placeholder="Table name" label="Table name" @change="saveTable()" />
    
            <UiButton @click="table.logDataComparison()">Log data comparison</UiButton>
            <UiButton @click="logTable(table)">Log table data</UiButton>
        </section>
    </div>
</template>
