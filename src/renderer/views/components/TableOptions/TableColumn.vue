<script setup lang="ts">
    import { PropType, Ref, toRef, ref, defineEmits } from "vue"
    import Column from "@Common/models/Column"
    import ColumnTypeList from "@Common/models/column-types/base/ColumnTypeList"
    import debounce from "@Common/tools/debounce"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiDropdownSelect from "@Renderer/components/ui/UiDropdownSelect.vue"

    const onDevelopment = Main.API.onDevelopment()

    const props = defineProps({
            column: {
                type: Object as PropType<Column>,
                required: true,
            },
        }),
        emit = defineEmits(["removeColumn"]) // temporary code

    const column = toRef(props, "column") as Ref<Column>,
        showingOptions = ref(false),
        columnTypes = ColumnTypeList.getArray()

    const onNameUpdated = () => {
        const hasDuplicateColumnName = column.value.table.hasColumnExceptId(column.value.name, column.value.id)

        if(hasDuplicateColumnName) {
            onColumnNameDuplicated()
            return
        }

        column.value.setDefaultSettingsByName()
        saveColumn()
    }

    // debounced
    const saveColumn = debounce(() => {
        column.value.saveFromInterface()
    }, 500)

    const onColumnNameDuplicated = () => {
        Alert.error(`Column <b class="underline underline-offset-4">${column.value.name}</b> already exists`)

        column.value.name = ''
        column.value.saveFromInterface()

        document.getElementById(`table-column-${column.value.id}`)?.focus()
    }

    const onUniqueChanged = () => {
        let defaultColumnFaker = column.value.getDefaultFaker(),
            defaultColumnUniqueFaker = column.value.getDefaultUniqueFaker()

        if(column.value.faker == defaultColumnFaker && column.value.unique) {
            column.value.faker = defaultColumnUniqueFaker
        }

        if(column.value.faker == defaultColumnUniqueFaker && !column.value.unique) {
            column.value.faker = defaultColumnFaker
        }

        column.value.saveFromInterface()
    }

    const getColumnTypes = () => {
        return columnTypes.map((columnType: any) => {
            return {
                key: columnType.identifier,
                label: columnType.label,
                description: columnType.help
            }
        })
    }

    const removeColumn = () => {
        Main.API.confirm("Are you sure you want to remove this column?").then((confirmed: boolean) => {
            if(!confirmed) return

            column.value.remove()
            emit('removeColumn')
        })
    }
</script>

<template>
    <div
        :class="{
            'border-yellow-400': column.autoIncrement,
            'border-red-400': column.isForeign(),
            'border-orange-400': column.isUnique(),
            'border-blue-400': column.isNotForeignIndex(),
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
                    <UiText placeholder="Name" :id="`table-column-${column.id}`" v-model="column.name" @input="onNameUpdated" />
                </div>

                <div class="flex flex-col w-36">
                    <UiDropdownSelect v-model="column.type" placeholder="Select type" :options="getColumnTypes()" @change="column.saveFromInterface()" />
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
                    <UiCheckbox v-model="column.unique" label="Unique" @change="onUniqueChanged" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.index" label="Index" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.unsigned" label="Unsigned" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.autoIncrement" label="Auto Increment" @change="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3">
                <div class="m-1 flex-1">
                    <UiNumber label="Length" v-model="column.length" @input="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1">
                    <UiText label="Default Value" v-model="column.default" @input="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3" v-if="column.isFloatingPointNumber()">
                <div class="m-1 flex-1">
                    <UiNumber label="Precision" v-model="column.total" @input="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1">
                    <UiNumber label="Scale" v-model="column.places" @input="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3">
                <div class="m-1 flex-1">
                    <UiText label="Faker" v-model="column.faker" :placeholder="column.faker" @input="column.saveFromInterface()"  />
                </div>
            </div>
            
            <div class="mt-4" v-if="onDevelopment">
                <UiButton @click="column.logDataComparison()">Log data comparison</UiButton>
            </div>
        </div>

    </div>
</template>
