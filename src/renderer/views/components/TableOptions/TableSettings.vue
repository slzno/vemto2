<script setup lang="ts">
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { defineProps, toRef } from 'vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'

    const props = defineProps(['table']),
        table = toRef(props, 'table')

    const saveTable = () => {
        table.value.saveFromInterface()
    }

    const logTable = (table: any) => {
        console.log(table)
    }
</script>
<template>
    <div>
        <section class="space-y-2">
            <div>
                <UiText v-model="table.name" placeholder="Table name" label="Table name" @input="saveTable()" />
            </div>

            <div>
                <UiSelect v-model="table.labelColumnId" label="Label column" @change="table.save()" >
                    <option :value="null" disabled>Select a column</option>
                    <option v-for="column in table.columns" :value="column.id" :key="column.id">{{ column.name }}</option>
                </UiSelect>
            </div>
            
            <div>
                <UiButton @click="table.logDataComparison()">Log data comparison</UiButton>
                <UiButton @click="logTable(table)">Log table data</UiButton>
            </div>
        </section>
    </div>
</template>
