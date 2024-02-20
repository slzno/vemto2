<script setup lang="ts">
    import { defineProps, toRef, ref, onMounted, watch } from 'vue'
    import Index from '@Common/models/Index'
    import Column from '@Common/models/Column'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import IndexTypes from '@Common/models/static/IndexTypes'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import UiMultiSelect from '@Renderer/components/ui/UiMultiSelect.vue'
    import { PlusCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import Main from "@Renderer/services/wrappers/Main"
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiOptionsDropdown from '@Renderer/components/ui/UiOptionsDropdown.vue'
    import UiDropdownItem from '@Renderer/components/ui/UiDropdownItem.vue'
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"

    const props = defineProps(['table']),
        table = toRef(props, 'table'),
        tableIndexes = ref([]),
        confirmDeleteDialog = ref(null)

    const onDevelopment = Main.API.onDevelopment()

    onMounted(() => {
        tableIndexes.value = props.table.getIndexes()
    })

    watch(table, () => {
        tableIndexes.value = table.value.getIndexes()
    })

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

    const getReferredTableColumns = (index: Index) => {
        if(!index.onTable) return []

        return getForSelect(index.onTable.getColumns())
    }

    const saveIndexColumns = (index: Index, selectValue: Array<Object>): void => {
        const columnsNames = selectValue.map((item: any) => item.value)

        index.updateColumns(columnsNames)
    }

    const onEscapePressed = (index: Index) => {
        if(!index.type || !index.name) {
            onIndexRemoving(index, true)
        }
    }

    const addIndex = () => {
        const index = new Index({
            tableId: table.value.id,
            onUpdate: 'cascade',
            onDelete: 'cascade'
        }).saveFromInterface()

        tableIndexes.value.push(index)
    }

    const saveIndex = (index: Index) => {
        index.saveFromInterface()
    }

    const onIndexRemoving = async (index: Index, force: boolean = false) => {
        const removeIndex = () => {
            index.remove()
            tableIndexes.value.splice(tableIndexes.value.indexOf(index), 1)
        }

        if(force) {
            removeIndex()
            return
        }

        const confirmed = await confirmDeleteDialog.value.confirm()
        if(!confirmed) return

        removeIndex()
    }

    const log = (index: Index) => {
        console.log(index)
        console.log("Is Dirty: ", index.isDirty())
    }
</script>
<template>
    <div>
        <UiConfirm ref="confirmDeleteDialog">
            Are you sure you want to remove this index?
        </UiConfirm>

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
                <!-- <div class="mt-4" v-if="onDevelopment">
                    <UiButton @click="log(index)">Log details</UiButton>
                    <UiButton @click="index.logDataComparison()">Log data comparison</UiButton>
                </div> -->
                <div class="flex gap-2 mb-2">
                    <div class="w-[10rem]">
                        <UiDropdownSelect
                            label="Type"
                            v-model="index.type"
                            :options="IndexTypes.getForDropdown()"
                            placeholder="Index Type"
                            @change="saveIndex(index)"
                            :may-open="!index.type && !index.name"
                        />
                    </div>
        
                    <div class="flex-1">
                        <UiText 
                            label="Name"
                            placeholder="Index name" 
                            v-model="index.name" 
                            :disabled="true" 
                        />
                    </div>
    
                    <div class="flex items-center justify-center">
                        <UiOptionsDropdown>
                            <UiDropdownItem @click="onIndexRemoving(index)">
                                <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                            </UiDropdownItem>
                        </UiOptionsDropdown>
                    </div>
                </div>
        
                <div class="flex gap-2 mb-2" v-if="index.isForeign()">
                    <div class="flex-1">
                        <UiDropdownSelect
                            label="References Column"
                            v-model="index.referencesColumnId"
                            :options="getReferredTableColumns(index)"
                            placeholder="References Column"
                            :may-open="index.isForeign() && !index.name && index.onTableId"
                            @change="saveIndex(index)"
                        />
                    </div>
        
                    <div class="flex-1">
                        <UiDropdownSelect
                            label="On Table"
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
                        @change="$event => saveIndexColumns(index, $event)"
                    />
                </div>
        
                <div v-if="index.isForeign()">
                    <div class="mb-2">
                        <UiText
                            placeholder="On Update"
                            label="On Update"
                            v-model="index.onUpdate"
                            @input="saveIndex(index)"
                        />
                    </div>
                    <div class="mb-2">
                        <UiText
                            placeholder="On Delete"
                            label="On Delete"
                            v-model="index.onDelete"
                            @input="saveIndex(index)"
                        />
                    </div>
                </div>
            </div>
        </div>
    
        <button
            class="mt-4 flex w-full justify-center text-slate-400 hover:text-red-500 cursor-pointer text-lg"
            @click="addIndex"
            v-shortkey="['ctrl', 'shift', 'i']" @shortkey="addIndex"
        >
            <div class="flex items-center">
                <PlusCircleIcon class="w-8 h-8" />
                <span class="px-1.5 flex items-center space-x-2">
                    <small class="rounded px-2 py-1 bg-slate-900 text-slate-300 text-xs">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
                    </small>

                    <span>Add Index</span>
                </span>
            </div>
        </button>
    </div>
</template>
