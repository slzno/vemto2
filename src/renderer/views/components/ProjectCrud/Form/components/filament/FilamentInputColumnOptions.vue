<script setup lang="ts">
    import debounce from "@Common/tools/debounce"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import { capitalCase } from "change-case"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import UiDate from "@Renderer/components/ui/UiDate.vue"
    import { PlusCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { defineProps, toRef, PropType } from 'vue'
    import Input from "@Common/models/crud/Input"
    import FilamentColumnTypesList from "@Common/models/crud/filament/FilamentColumnTypesList"

    const props = defineProps({
            input: Object as PropType<Input>
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

    const removeEmptyColumnPropertyData = (propertyName: string) => {
        input.value.filamentSettings.columnData[propertyName] = input.value.filamentSettings.columnData[propertyName]
            .filter(item => item.label !== "" || item.color !== "")

        saveInput()
    }

    const addItemForProperty = (propertyName: string) => {
        if(!input.value.filamentSettings.columnData[propertyName]) input.value.filamentSettings.columnData[propertyName] = []

        input.value.filamentSettings.columnData[propertyName].push({
            label: "",
            color: ""
        })
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

        <div>
            <UiText v-model="input.filamentSettings.columnData.label" placeholder="Label" label="Column Label" @input="saveInput()" />
        </div>

        <div v-if="filamentColumnTypeIs('text-column')">
            <UiText v-model="input.filamentSettings.columnData.description" placeholder="Description" label="Column Description" @input="saveInput()" />
        </div>

        <div class="grid grid-cols-2 gap-2" v-if="filamentColumnTypeIs('text-column')">
            <div>
                <UiText v-model="input.filamentSettings.columnData.iconName" placeholder="Icon Name" label="Column Icon Name" @input="saveInput()" />
            </div>

            <div>
                <UiText v-model="input.filamentSettings.columnData.iconColor" placeholder="Icon Color" label="Column Icon Color" @input="saveInput()" />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2" v-if="filamentColumnTypeIs('text-column')">
            <div>
                <UiText v-model="input.filamentSettings.columnData.prefix" placeholder="Prefix" label="Column Prefix" @input="saveInput()" />
            </div>

            <div>
                <UiText v-model="input.filamentSettings.columnData.suffix" placeholder="Suffix" label="Column Suffix" @input="saveInput()" />
            </div>
        </div>

        <div v-if="filamentColumnTypeIs('text-column')">
            <UiNumber v-model="input.filamentSettings.columnData.textLimit" placeholder="Limit" label="Text Limit" @input="saveInput()" />
        </div>

        <!-- TextColumn badge colors -->
        <div class="flex gap-4 flex-col" v-if="filamentColumnTypeIs('text-column')">
            <div>
                <UiCheckbox v-model="input.filamentSettings.columnData.showAsBadge" label="Show as badge" @input="saveInput()" />
                <small v-if="input.filamentSettings.columnData.showAsBadge" class="text-slate-400 underline">It is recommended that you add the <b>'default'</b> key if you cannot list all options here.</small>
            </div>
            
            <div class="-mt-2" :class="{ 'opacity-60': !input.filamentSettings.columnData.showAsBadge }">
                <div class="max-h-[300px] overflow-y-auto">
                    <template v-for="(item, index) in input.filamentSettings.columnData.badgeColors" :key="index">
                        <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyColumnPropertyData('badgeColors')">
                            <div class="w-2/4">
                                <UiText :disabled="!input.filamentSettings.columnData.showAsBadge" v-model="item.label" placeholder="Item Label" @input="saveInput()" />
                            </div>
                            <div class="w-2/4">
                                <UiText :disabled="!input.filamentSettings.columnData.showAsBadge" v-model="item.color" placeholder="Item Color" @input="saveInput()" />
                            </div>
                            <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeFilamentOption('badgeColors', index)" />
                        </div>
                    </template>
                </div>

                <UiSmallButton :disabled="!input.filamentSettings.columnData.showAsBadge" @click="addItemForProperty('badgeColors')">
                    <span class="flex items-center">
                        <PlusCircleIcon class="w-5 h-5 mr-1" />
                        Add Color
                    </span>
                </UiSmallButton>
            </div>

            <div>
                <UiCheckbox v-model="input.filamentSettings.columnData.showAsNumeric" label="Show as Numeric" @input="saveInput()" />
                
                <div class="grid grid-cols-3 gap-2 mt-2">
                    <UiNumber :disabled="!input.filamentSettings.columnData.showAsNumeric" v-model="input.filamentSettings.columnData.decimalPlaces" label="Decimal Places" @input="saveInput()" />
                    <UiText :disabled="!input.filamentSettings.columnData.showAsNumeric" v-model="input.filamentSettings.columnData.decimalSeparator" label="Decimal Separator" @input="saveInput()" />
                    <UiText :disabled="!input.filamentSettings.columnData.showAsNumeric" v-model="input.filamentSettings.columnData.thousandsSeparator" label="Thousands Separator" @input="saveInput()" />
                </div>
            </div>

            <div>
                <UiCheckbox v-model="input.filamentSettings.columnData.showAsCurrency" label="Show as Currency" @input="saveInput()" />
                
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <UiText :disabled="!input.filamentSettings.columnData.showAsCurrency" v-model="input.filamentSettings.columnData.currencySymbol" label="Currency Symbol" @input="saveInput()" />
                    <UiNumber :disabled="!input.filamentSettings.columnData.showAsCurrency" v-model="input.filamentSettings.columnData.divideBy" label="Divide By" @input="saveInput()" />
                </div>
            </div>

            <UiCheckbox v-model="input.filamentSettings.columnData.isMarkdown" label="Show as Markdown" @input="saveInput()" />
        </div>
        
        <!-- IconColumn badge colors -->
        <div v-if="filamentColumnTypeIs('icon-column')">
            <div class="flex justify-between mb-2">
                <label class="text-xs text-slate-400">Badge Colors</label>
            </div>

            <div class="max-h-[300px] overflow-y-auto">
                <template v-for="(item, index) in input.filamentSettings.columnData.badgeColors" :key="index">
                    <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyColumnPropertyData('badgeColors')">
                        <div class="w-2/4">
                            <UiText v-model="item.label" placeholder="Item Label" @input="saveInput()" />
                        </div>
                        <div class="w-2/4">
                            <UiText v-model="item.color" placeholder="Item Color" @input="saveInput()" />
                        </div>
                        <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeFilamentOption('badgeColors', index)" />
                    </div>
                </template>
            </div>

            <UiSmallButton @click="addItemForProperty('badgeColors')">
                <span class="flex items-center">
                    <PlusCircleIcon class="w-5 h-5 mr-1" />
                    Add Color
                </span>
            </UiSmallButton>
        </div>

        <div v-if="filamentColumnTypeIs('icon-column')">
            <div class="flex justify-between mb-2">
                <label class="text-xs text-slate-400">Icons</label>
            </div>

            <div class="max-h-[300px] overflow-y-auto">
                <template v-for="(item, index) in input.filamentSettings.columnData.icons" :key="index">
                    <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyColumnPropertyData('icons')">
                        <div class="w-2/4">
                            <UiText v-model="item.label" placeholder="Item Label" @input="saveInput()" />
                        </div>
                        <div class="w-2/4">
                            <UiText v-model="item.iconName" placeholder="Icon Name" @input="saveInput()" />
                        </div>
                        <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeFilamentOption('icons', index)" />
                    </div>
                </template>
            </div>

            <UiSmallButton @click="addItemForProperty('icons')">
                <span class="flex items-center">
                    <PlusCircleIcon class="w-5 h-5 mr-1" />
                    Add Icon
                </span>
            </UiSmallButton>
        </div>

        <div>
            <UiCheckbox v-model="input.filamentSettings.columnData.canBeSortable" label="Can be Sortable" @input="saveInput()" />
        </div>
        
        <div>
            <UiCheckbox v-model="input.filamentSettings.columnData.canBeSearchable" label="Can be Searchable" @input="saveInput()" />
        </div>

        <div>
            <UiCheckbox v-model="input.filamentSettings.columnData.canBeToggled" label="Can be Toggled" @input="saveInput()" />
        </div>
    </div>
</template>