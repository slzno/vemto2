<script setup lang="ts">
    import { defineProps, toRef, ref, onMounted } from 'vue'
    import Index from '@Common/models/Index'
    import Column from '@Common/models/Column'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import IndexTypes from '@Common/models/static/IndexTypes'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import UiMultiSelect from '@Renderer/components/ui/UiMultiSelect.vue'
    import debounce from '@Renderer/../common/tools/debounce'
    import { PlusCircleIcon, EllipsisVerticalIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import Main from "@Renderer/services/wrappers/Main"
    import { uniq } from 'lodash'
import WordManipulator from '@Renderer/../common/util/WordManipulator'

    const props = defineProps(['table']),
        table = toRef(props, 'table'),
        tableIndexes = ref([]),
        showIndexOption = ref(null)

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
        if(!index.onTable) return []

        return getForSelect(index.onTable.getColumns())
    }

    const saveRelationshipProperty = (index: Index, selectValue: Array<Object>, modelPropertyName: string, modelPropertyRelationship: string): void => {
        const columnNames = selectValue.map((item: any) => item.value),
            uniqueColumnNames = uniq(columnNames.concat(index[modelPropertyName]))
            
        uniqueColumnNames.forEach((columnName: string) => {
            const column = index.table.getColumnByName(columnName)

            if(!column) return

            if(columnNames.includes(columnName)) {
                index.relation(modelPropertyRelationship).attachUnique(column)
                return
            }

            index.relation(modelPropertyRelationship).detach(column)
            uniqueColumnNames.splice(uniqueColumnNames.indexOf(columnName), 1)
        })

        index[modelPropertyName] = uniqueColumnNames

        saveIndex(index)
        generateIndexName(index)
    }

    const generateIndexName = (index: Index) => {
        const sortedColumns = index.indexColumns.sort((colOne: Column, colTwo: Column) => colOne.order - colTwo.order),
            columnsNames = sortedColumns.map((column: Column) => column.name).join('_')

        index.name = `${index.table.name}_${columnsNames}_${WordManipulator.snakeCase(index.type)}`.replace(/_{2,}/g, '_')
        saveIndex(index)
    }

    const onEscapePressed = (index: Index) => {
        if(!index.type || !index.name) {
            onIndexRemoving(index, true)
        }
    }

    const addIndex = () => {
        const index = new Index({
            tableId: table.value.id
        }).saveFromInterface()

        tableIndexes.value.push(index)
    }

    const saveIndex = debounce((index: Index) => {
        index.saveFromInterface()
    }, 500)

    const onIndexRemoving = (index: Index, force: boolean = false) => {
        const removeIndex = () => {
            index.remove()
            tableIndexes.value.splice(tableIndexes.value.indexOf(index), 1)
        }

        if(force) {
            removeIndex()
            return
        }

        Main.API.confirm("Are you sure you want to remove this index?").then((confirmed: boolean) => {
            if(!confirmed) return

            removeIndex()
        })
    }

    onMounted(() => {
        tableIndexes.value = props.table.getIndexes()
    })
</script>
<template>
    <div>
        <div
            v-for="index in tableIndexes"
            :key="index.id"
            @keyup.escape="onEscapePressed(index)"
            class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow mb-4"
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
                        :may-open="!index.type && !index.name"
                    />
                </div>
    
                <div class="flex-1">
                    <UiText placeholder="Index name" v-model="index.name" :disabled="true" />
                </div>

                <div class="p-1 relative">
                    <EllipsisVerticalIcon class="h-6 w-6 text-slate-400 cursor-pointer" @click="showIndexOption = showIndexOption == index.id ? null : index.id" />
                    <div class="bg-slate-950 w-auto rounded absolute z-[20] p-1 right-0 top-8 border border-gray-700" v-if="showIndexOption == index.id">
                        <ul>
                            <li class="flex items-center justify-start text-md p-1 cursor-pointer" @click="onIndexRemoving(index)">
                                <TrashIcon class="h-5 w-5 mr-1 text-red-400" />
                                Delete
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
    
            <div class="flex gap-2 mb-2" v-if="index.isForeign()">
                <div class="flex-1">
                    <UiDropdownSelect
                        v-model="index.referencesColumnId"
                        :options="getTableColumnsFromIndexType(index)"
                        placeholder="References Column"
                        :may-open="index.isForeign() && !index.name && index.onTableId"
                        @change="saveIndex(index)"
                    />
                </div>
    
                <div class="flex-1">
                    <UiDropdownSelect
                        v-model="index.onTableId"
                        :options="getForSelect(table.project.getTables())"
                        placeholder="On Table"
                        :may-open="index.isForeign() && !index.name && !index.onTableId"
                        @change="saveIndex(index)"
                    />
                </div>
            </div>
    
            <div class="mb-2">
                <UiMultiSelect
                    inputLabel="Columns"
                    :default-value="getSelectDataForLayout(index.indexColumns)"
                    :options="getSelectDataForLayout(index.table.getColumns())"
                    @change="$event => saveRelationshipProperty(index, $event, 'columns', 'indexColumns')"
                />
            </div>
    
            <div v-if="index.isForeign()">
                <div class="mb-2">
                    <UiText
                        placeholder="On Update"
                        label="On Update"
                        :inline-label="true"
                        v-model="index.onUpdate"
                        @input="saveIndex(index)"
                    />
                </div>
                <div class="mb-2">
                    <UiText
                        placeholder="On Delete"
                        label="On Delete"
                        :inline-label="true"
                        v-model="index.onDelete"
                        @input="saveIndex(index)"
                    />
                </div>
            </div>
        </div>
    </div>

    <section
        class="flex w-full justify-center text-slate-400 hover:text-red-500 cursor-pointer text-lg"
        @click="addIndex"
    >
        <div class="flex items-center">
            <PlusCircleIcon class="w-8 h-8" />
            <span class="px-1.5">Add Index</span>
        </div>
    </section>
</template>
