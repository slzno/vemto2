<script setup lang="ts">
    import debounce from "@Common/tools/debounce"
    import { InputType } from "@Common/models/crud/InputType"
    import FilamentInputTypesList from "@Common/models/crud/filament/FilamentInputTypesList"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import { capitalCase } from "change-case"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import UiDate from "@Renderer/components/ui/UiDate.vue"
    import { PlusCircleIcon, TrashIcon, ArrowLongUpIcon, ArrowLongDownIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { defineProps, toRef } from 'vue'
    import Input from "@Common/models/crud/Input"
    import FilamentColumnTypesList from "@Common/models/crud/filament/FilamentColumnTypesList"

    const props = defineProps({
            input: Input
        }),
        input = toRef(props, "input")

    const saveInput = debounce(() => {
        input.value.save()
    }, 500);

    const filamentColumnTypeIs = (type: string | string[]) => {
        if(!Array.isArray(type)) type = [type]

        return type.includes(input.value.filamentSettings.columnData.columnType)
    }

    const removeFilamentOption = (propertyName: string, index: number) => {
        input.value.filamentSettings.columnData[propertyName].splice(index, 1)
        saveInput()
    }

    const newFilamentOption = (propertyName: string) => {
        if(!input.value.filamentSettings.columnData[propertyName]) input.value.filamentSettings.columnData[propertyName] = []

        input.value.filamentSettings.columnData[propertyName].push('')
    }

    const moveUpOption = (propertyName: string, index: number) => {
        if(index === 0) return

        const option = input.value.filamentSettings.columnData[propertyName][index]
        input.value.filamentSettings.columnData[propertyName].splice(index, 1)
        input.value.filamentSettings.columnData[propertyName].splice(index - 1, 0, option)
        saveInput()
    }

    const moveDownOption = (propertyName: string, index: number) => {
        if(index === input.value.filamentSettings.columnData[propertyName].length - 1) return

        const option = input.value.filamentSettings.columnData[propertyName][index]
        input.value.filamentSettings.columnData[propertyName].splice(index, 1)
        input.value.filamentSettings.columnData[propertyName].splice(index + 1, 0, option)
        saveInput()
    }

    const getFilamentTypeSuggestions = () => {
        return FilamentColumnTypesList.getSuggestionsFromInputType(input.value.type)
    }
</script>
<template>
    <div class="p-4 space-y-4">
        <div v-if="!filamentColumnTypeIs('hidden')">
            <UiSelect v-model="input.filamentSettings.columnData.columnType" label="Column Type" @change="saveInput()">
                <template v-for="suggestion in getFilamentTypeSuggestions()">
                    <option :value="suggestion">{{ capitalCase(suggestion) }}</option>
                </template>
            </UiSelect>
        </div>

        <div v-if="filamentColumnTypeIs('text-column')">
            <UiText v-model="input.filamentSettings.columnData.description" placeholder="Description" label="Column Description" @input="saveInput()" />
        </div>

        <div v-if="filamentColumnTypeIs('text-column')">
            <UiText v-model="input.filamentSettings.columnData.prefix" placeholder="Prefix" label="Column Prefix" @input="saveInput()" />
        </div>

        <div v-if="filamentColumnTypeIs('text-column')">
            <UiText v-model="input.filamentSettings.columnData.suffix" placeholder="Suffix" label="Column Suffix" @input="saveInput()" />
        </div>

        <div>
            <UiText v-model="input.filamentSettings.columnData.label" placeholder="Label" label="Column Label" @input="saveInput()" />
        </div>
        
        <div>
            <UiCheckbox v-model="input.filamentSettings.columnData.canBeSortable" label="Can be sortable" @input="saveInput()" />
        </div>
        
        <div>
            <UiCheckbox v-model="input.filamentSettings.columnData.canBeSearchable" label="Can be searchable" @input="saveInput()" />
        </div>

        <div>
            <UiCheckbox v-model="input.filamentSettings.columnData.canBeToggled" label="Can be toggled" @input="saveInput()" />
        </div>

        <div v-if="filamentColumnTypeIs('text-column')">
            <UiCheckbox v-model="input.filamentSettings.columnData.showAsBadge" label="Show as badge" @input="saveInput()" />
        </div>
    </div>
</template>