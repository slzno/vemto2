<script setup lang="ts">
    import { PropType, Ref, toRef, ref, defineEmits, nextTick } from "vue"
    import Column from "@Common/models/Column"
    import ColumnTypeList from "@Common/models/column-types/base/ColumnTypeList"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import { Bars3Icon, ChevronDownIcon, ChevronUpIcon, TrashIcon, PlusCircleIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiDropdownSelect from "@Renderer/components/ui/UiDropdownSelect.vue"
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import UiOptionsDropdown from '@Renderer/components/ui/UiOptionsDropdown.vue'
    import UiDropdownItem from '@Renderer/components/ui/UiDropdownItem.vue'
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import debounce from "@Common/tools/debounce"
    import UiHint from "@Renderer/components/ui/UiHint.vue"

    const onDevelopment = Main.API.onDevelopment() && !Main.API.isRecording(),
        projectStore = useProjectStore()

    const props = defineProps({
            column: {
                type: Object as PropType<Column>,
                required: true,
            },
        }),
        emit = defineEmits(["removeColumn"]) // temporary code

    const column = toRef(props, "column") as Ref<Column>,
        showingOptions = ref(false),
        columnTypes = ColumnTypeList.getEnabled(projectStore.project),
        confirmDeleteDialog = ref(null),
        canBeFocused = ref(true)

    const onNameUpdated = debounce(() => {
        column.value.setDefaultSettingsByName()
        saveColumn()
    }, 250)

    const onNameBlur = () => {
        if(column.value.hasDuplicatedName()) {
            treatDuplicatedColumnName()
        }
    }

    const saveColumn = () => {
        column.value.saveFromInterface()
    }

    const treatDuplicatedColumnName = () => {
        Alert.error(`Column <b class="underline underline-offset-4">${column.value.name}</b> already exists`)

        column.value.name = ''
        column.value.saveFromInterface()

        focusAtColumn(column.value.id)
    }

    const treatReservedKeyword = () => {
        Alert.error(`This column name is a reserved PHP keyword`)

        column.value.name = ''
        column.value.saveFromInterface()

        focusAtColumn(column.value.id)
    }

    const focusAtColumn = (columnId: string) => {
        if(!canBeFocused.value) return

        canBeFocused.value = false

        nextTick(() => {
            document.getElementById(`table-column-${columnId}`)?.focus()
        })

        setTimeout(() => {
            canBeFocused.value = true
        }, 1000)
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
        console.log(columnTypes)
        return columnTypes.map((columnType: any) => {
            return {
                key: columnType.identifier,
                label: columnType.label,
                description: columnType.help
            }
        })
    }

    const newColumnOption = () => {
        if(!column.value.options) column.value.options = []

        column.value.options.push('')
    }

    const removeColumnOptions = async (index: number) => {
        const confirmed = await window.projectConfirm("Are you sure you want to remove this option?")

        if(!confirmed) return
        
        column.value.options.splice(index, 1)
        column.value.saveFromInterface()
    }

    const removeColumn = async () => {
        if(column.value.isInvalid()) {
            column.value.remove()
            emit('removeColumn')
            return
        }

        const confirmed = await confirmDeleteDialog.value.confirm()
        if(!confirmed) return

        column.value.remove()
        emit('removeColumn')
    }

    const onColumnTypeChanged = (values: { lastValue: string, newValue: string }) => {
        if(['uuid', 'ulid'].includes(values.newValue) || ['uuid', 'ulid'].includes(values.lastValue)) {
            column.value.isUuid = values.newValue === 'uuid'
            column.value.isUlid = values.newValue === 'ulid'
        }
        
        if (values.lastValue && values.lastValue.length) return;

        let defaultColumnFaker = column.value.getDefaultFaker(),
            defaultColumnUniqueFaker = column.value.getDefaultUniqueFaker()

        column.value.faker = column.value.unique
            ? defaultColumnUniqueFaker
            : defaultColumnFaker

        column.value.saveFromInterface()
    }

    const log = (column: Column) => {
        console.log(JSON.parse(JSON.stringify(column)))
    }
</script>

<template>
    <div
        :class="{
            'border-yellow-400': column.isPrimaryKey(),
            'border-red-400': column.isForeign(),
            'border-orange-400': column.isUnique(),
            'border-blue-400': column.isNotForeignIndex(),
        }"
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <UiConfirm ref="confirmDeleteDialog">
            Are you sure you want to remove the <span class="text-red-400">{{ column.name }}</span> column?
        </UiConfirm>

        <div class="flex space-x-2 items-center">
            <div class="px-2 handle">
                <Bars3Icon
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"
                />
            </div>

            <div class="flex flex-grow space-x-2">
                <div class="flex flex-col flex-grow">
                    <UiText placeholder="Name" :id="`table-column-${column.id}`" v-model="column.name" @input="onNameUpdated" @blur="onNameBlur" />
                </div>

                <div class="flex flex-col w-36">
                    <UiDropdownSelect v-model="column.type" placeholder="Select type" :options="getColumnTypes()" @change="onColumnTypeChanged" />
                </div>

                <div class="flex items-center justify-between">
                    <UiCheckbox small-text v-model="column.nullable" label="Nullable" @change="column.saveFromInterface()" />
                </div>

                <div class="flex items-center justify-between pl-2" @click="removeColumn">
                    <TrashIcon class="w-4 h-4 text-slate-500 hover:text-red-500 cursor-pointer" />
                </div>
            </div>

            <button class="px-2 border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none rounded" @click="showingOptions = !showingOptions">
                <component :is="showingOptions ? ChevronUpIcon : ChevronDownIcon"
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"
                />
            </button>
        </div>

        <div class="flex m-2 flex-col space-y-4 mt-4" v-if="showingOptions">
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
                <div class="m-1">
                    <UiCheckbox v-model="column.isUuid" label="IsUuid" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.isUlid" label="IsUlid" @change="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3">
                <div class="m-1 flex-1">
                    <UiNumber label="Length" v-model="column.length" @input="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1 mt-1">
                    <UiText label="Default Value" v-model="column.default" @input="column.saveFromInterface()" />
                    <div class="flex">
                        <UiCheckbox v-model="column.defaultIsRaw" label="Raw" @change="column.saveFromInterface()" />
                        <UiHint type="warning">
                            When the default is marked as raw, Vemto will not sync the default value when reading the Schema (it is necessary to do it manually, because Vemto cannot read the migrations to get the raw default value). So, if you are using raw defaults, it is better to update them inside Vemto, instead of the migration file.
                        </UiHint>
                    </div>
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

            <div class="flex flex-col gap-2 m-1" v-if="column.mustHaveOptions()">
                <label class="text-xs text-slate-400">Options</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of column.options">
                    <UiText v-model="column.options[index]" @input="column.saveFromInterface()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="removeColumnOptions(index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiButton
                        @click="newColumnOption()"
                    >
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Option
                        </span>
                    </UiButton>
                </div>
            </div>
            
            <div class="mt-4" v-if="onDevelopment">
                <UiButton @click="column.logDataComparison()">Log data comparison</UiButton>
                <UiButton @click="log(column)">Log details</UiButton>
            </div>
        </div>

    </div>
</template>
