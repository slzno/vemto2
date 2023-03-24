<script setup lang="ts">
    import { PropType, Ref, toRef, ref } from "vue"
    import Column from "@Common/models/Column"
    import ColumnTypeList from "@Common/models/column-types/base/ColumnTypeList"
    import debounce from "@Common/tools/debounce"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import Alert from "@Renderer/components/utils/Alert"

    const props = defineProps({
        column: {
            type: Object as PropType<Column>,
            required: true,
        },
    })

    const column = toRef(props, "column") as Ref<Column>,
        showingOptions = ref(false)

    const columnTypes = ColumnTypeList.get() 

    // debounced
    const saveColumn = debounce(() => {
        if(column.value.table.hasColumnExceptId(column.value.name, column.value.id)) {
            Alert.error("Column already exists")
            return
        }

        if(!column.value.type) detectPossibleTypeByName()

        column.value.saveFromInterface()
    }, 500)

    const detectPossibleTypeByName = () => {
        if(!column.value) return

        let defaultColumnTypeData = column.value.getDefaultTypeByName()
            
        if(!defaultColumnTypeData) return

        column.value.type = defaultColumnTypeData.type
        column.value.length = defaultColumnTypeData.length || column.value.length
        column.value.nullable = defaultColumnTypeData.nullable || column.value.nullable
    }

    const removeColumn = () => {
        if(!confirm("Are you sure you want to remove this column?")) return

        column.value.remove()
    }
</script>

<template>
    <div
        :class="{
            'border-yellow-400': column.autoIncrement,
            'border-red-400': column.isForeign(),
            'border-orange-400': column.isUnique(),
        }"
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div class="flex space-x-2 items-center">
            <div class="px-2">
                <Bars3Icon
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"
                />
            </div>

            <div class="flex flex-grow space-x-2">
                <div class="flex flex-col flex-grow">
                    <UiText placeholder="Name" :id="`table-column-${column.id}`" v-model="column.name" @change="saveColumn" />
                </div>

                <div class="flex flex-col w-36">
                    <UiSelect v-model="column.type" @change="column.saveFromInterface()">
                        <option v-for="columnType in columnTypes" :key="columnType.identifier" :value="columnType.identifier">
                            {{ columnType.label }}
                        </option>
                    </UiSelect>
                </div>

                <div class="flex items-center justify-between">
                    <UiCheckbox v-model="column.nullable" label="Nullable" @change="column.saveFromInterface()" />
                </div>

                <div class="flex items-center justify-between" @click="removeColumn">
                    <TrashIcon class="w-4 h-4 text-red-500 cursor-pointer" />
                </div>
            </div>

            <div class="px-2" @click="showingOptions = !showingOptions">
                <component :is="showingOptions ? ChevronUpIcon : ChevronDownIcon"
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"
                />
            </div>
        </div>

        <div class="flex m-2 flex-col" v-if="showingOptions">
            <div class="flex gap-3">
                <div class="m-1">
                    <UiCheckbox v-model="column.unique" label="Unique" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.index" label="Index" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.unsigned" label="Unsigned" @change="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3">
                <div class="m-1 flex-1">
                    <UiNumber label="Length" v-model="column.length" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1">
                    <UiText label="Default Value" v-model="column.default" @change="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3" v-if="column.isFloatingPointNumber()">
                <div class="m-1 flex-1">
                    <UiNumber label="Precision" v-model="column.total" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1">
                    <UiNumber label="Scale" v-model="column.places" @change="column.saveFromInterface()" />
                </div>
            </div>
        </div>
    </div>
</template>
