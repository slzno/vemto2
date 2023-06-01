<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import Index from '@Common/models/Index'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import IndexTypes from '@Common/models/static/IndexTypes'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'

    const props = defineProps(['table']),
        table = toRef(props, 'table')

    const getForSelect = (
        collection: any,
        keyName: string = 'id',
        labelName: string = 'name'
    ) => {
        return collection.map((model: any) => {
            return {
                key: model[keyName],
                label: model[labelName]
            }
        })
    }

    const getTableColumnsFromIndexType = (index: Index) => {
        if (index.isNotForeign()) {
            return getForSelect(index.table.getColumns())
        }

        if(!index.onTableId || !index.onTable) return []

        return getForSelect(index.onTable.getColumns())
    }

    const onEscapePressed = (index: Index) => {
        console.log('onEscapePressed', index)
    }
</script>
<template>
    <div
        v-for="index in table.getIndexes()"
        :key="index.id"
        @keyup.escape="onEscapePressed(index)"
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow mb-2"
        :class="{
            'border-red-400': index.isForeign(),
            'border-orange-400': index.isUnique(),
            'border-blue-400': index.isCommon(),
        }"
    >
        <div class="flex gap-2 mb-2">
            <div class="w-[10rem]">
                <UiDropdownSelect
                    v-model="index.type"
                    :options="IndexTypes.getForDropdown()"
                    placeholder="Index Type"
                />
            </div>

            <div class="flex-1">
                <UiText placeholder="Index name" v-model="index.name" :disabled="true" />
            </div>
        </div>

        <div class="flex gap-2 mb-2">
            <div class="flex-1">
                <UiDropdownSelect
                    v-model="index.referencesColumnId"
                    :options="getTableColumnsFromIndexType(index)"
                    placeholder="References Column"
                />
            </div>

            <div class="flex-1" v-if="index.isForeign()">
                <UiDropdownSelect
                    v-model="index.onTableId"
                    :options="getForSelect(table.project.getTables())"
                    placeholder="On Table"
                />
            </div>
        </div>
    </div>
</template>
