<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import Index from '@Common/models/Index'
    import Column from '@Common/models/Column'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import IndexTypes from '@Common/models/static/IndexTypes'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import UiMultiSelect from '@Renderer/components/ui/UiMultiSelect.vue'
import debounce from '@Renderer/../common/tools/debounce'

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

    const getSelectDataForLayout = (property: Array<string>|Column[]): Array<Object> => {
        if(!property || !Array.isArray(property)) return []

        return property.map((guarded: string|Column) => {
            if(typeof guarded === "object") {
                guarded = guarded.name
            }

            return {
                label: guarded,
                value: guarded.toLowerCase(),
            }
        })
    }

    const getTableColumnsFromIndexType = (index: Index) => {
        if (index.isNotForeign()) {
            return getForSelect(index.table.getColumns())
        }

        if(!index.onTable) return []

        return getForSelect(index.onTable.getColumns())
    }

    const onEscapePressed = (index: Index) => {
        console.log('onEscapePressed', index)
    }

    const saveIndex = debounce((index: Index) => {
        index.saveFromInterface()
    }, 500)
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
                    @change="saveIndex(index)"
                />
            </div>

            <div class="flex-1">
                <UiText placeholder="Index name" v-model="index.name" :disabled="true" />
            </div>
        </div>

        <div class="flex gap-2 mb-2" v-if="index.isForeign()">
            <div class="flex-1">
                <UiDropdownSelect
                    v-model="index.referencesColumnId"
                    :options="getTableColumnsFromIndexType(index)"
                    placeholder="References Column"
                    @change="saveIndex(index)"
                />
            </div>

            <div class="flex-1">
                <UiDropdownSelect
                    v-model="index.onTableId"
                    :options="getForSelect(table.project.getTables())"
                    placeholder="On Table"
                    @change="saveIndex(index)"
                />
            </div>
        </div>

        <div class="mb-2">
            <UiMultiSelect
                inputLabel="Columns"
                :default-value="getSelectDataForLayout(index.indexColumns)"
                :options="getSelectDataForLayout(index.table.getColumns())"
            />
        </div>

        <div class="mb-2">
            <UiText placeholder="On Update" v-model="index.onUpdate" @input="saveIndex(index)" />
        </div>
        <div class="mb-2">
            <UiText placeholder="On Delete" v-model="index.onDelete" @input="saveIndex(index)" />
        </div>
    </div>
</template>
