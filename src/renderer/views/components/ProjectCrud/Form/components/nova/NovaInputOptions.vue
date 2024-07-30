<script setup lang="ts">
    import { toRef, defineProps, PropType } from 'vue'
    import Input from "@Common/models/crud/Input"
    import NovaInputTypesList from '@Common/models/crud/nova/NovaInputTypesList'
    import { NovaInputCodeLanguage } from '@Common/models/crud/nova/NovaInputSettings'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import debounce from '@Common/tools/debounce'
    import { capitalCase } from "change-case"
    import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiNumber from '@Renderer/components/ui/UiNumber.vue'
    import UiSmallButton from '@Renderer/components/ui/UiSmallButton.vue'
    import { ArrowLongDownIcon, ArrowLongUpIcon, PlusCircleIcon, TrashIcon } from '@heroicons/vue/24/outline'
    import UiDropdownItem from '@Renderer/components/ui/UiDropdownItem.vue'
    import UiOptionsDropdown from '@Renderer/components/ui/UiOptionsDropdown.vue'
    
    const props = defineProps({
            input: Object as PropType<Input>
        }),
        input = toRef(props, "input")

    const novaInputTypeIs = (type: string | string[]) => {
        if(!Array.isArray(type)) type = [type]

        return type.includes(input.value.novaSettings.inputType)
    }

    const saveInput = debounce(() => {
        input.value.save()
    }, 500);

    const getNovaTypeSuggestions = () => {
        return NovaInputTypesList.getSuggestionsFromInputType(input.value.type)
    }

    const removeEmptyPropertyData = (propertyName: string) => {
        input.value.novaSettings[propertyName] = input.value.novaSettings[propertyName]
            .filter(item => item.value !== "")

        saveInput()
    }

    const removeNovaData = (propertyName: string, index: number) => {
        input.value.novaSettings[propertyName].splice(index, 1)

        saveInput()
    }

    const addItemForProperty = (propertyName: string) => {
        if(!input.value.novaSettings[propertyName]) input.value.novaSettings[propertyName] = []

        input.value.novaSettings[propertyName].push({
            value: "",
            label: ""
        })
    }

    const newNovaOption = (propertyName: string) => {
        if(!input.value.novaSettings[propertyName]) input.value.novaSettings[propertyName] = []

        input.value.novaSettings[propertyName].push('')
    }

    const moveUpOption = (propertyName: string, index: number) => {
        if(index === 0) return

        const option = input.value.novaSettings[propertyName][index]
        input.value.novaSettings[propertyName].splice(index, 1)
        input.value.novaSettings[propertyName].splice(index - 1, 0, option)
        saveInput()
    }

    const moveDownOption = (propertyName: string, index: number) => {
        if(index === input.value.novaSettings[propertyName].length - 1) return

        const option = input.value.novaSettings[propertyName][index]
        input.value.novaSettings[propertyName].splice(index, 1)
        input.value.novaSettings[propertyName].splice(index + 1, 0, option)
        saveInput()
    }

    const getSupportedInputNovaLanguages = () => {
        return Object.values(NovaInputCodeLanguage)
    }
</script>
<template>
    <div class="flex-grow overflow-auto pb-40">
        <div class="p-4 space-y-4">
            <div>
                <UiSelect v-model="input.novaSettings.inputType" label="Input Type" @change="saveInput()">
                    <template v-for="suggestion in getNovaTypeSuggestions()">
                        <option :value="suggestion">{{ capitalCase(suggestion) }}</option>
                    </template>
                </UiSelect>
            </div>

            <div>
                <UiText v-model="input.novaSettings.helperText" label="Helper Text" @change="saveInput()" />
            </div>

            <div class="space-y-4" v-if="input.isFileOrImage()">
                <div class="gap-4 grid grid-cols-2">
                    <div>
                        <UiText v-model="input.novaSettings.disk" label="Disk" @change="saveInput()" />
                    </div>

                    <div>
                        <UiText v-model="input.novaSettings.storeOriginalName" label="Store Original Name" @change="saveInput()" />
                    </div>

                    <div>
                        <UiText v-model="input.novaSettings.storeSize" label="Store Size" @change="saveInput()" />
                    </div>

                    <div>
                        <UiText v-model="input.novaSettings.path" label="Path" @change="saveInput()" />
                    </div>
                </div>

                <div class="gap-4 grid grid-cols-3">
                    <div>
                        <UiNumber v-model="input.novaSettings.maxWidth" label="Max Width" @change="saveInput()" />
                    </div>

                    <div>
                        <UiNumber v-model="input.novaSettings.indexWidth" label="Index Width" @change="saveInput()" />
                    </div>

                    <div>
                        <UiNumber v-model="input.novaSettings.detailWidth" label="Detail Width" @change="saveInput()" />
                    </div>
                </div>
                
                <div class="flex flex-col gap-2">
                    <label class="text-xs text-slate-400">Accepted Types</label>

                    <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.novaSettings.acceptedTypes">
                        <UiText v-model="input.novaSettings.acceptedTypes[index]" @input="saveInput()" />

                        <UiOptionsDropdown>
                            <UiDropdownItem @click="moveUpOption('acceptedTypes', index)">
                                <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                            </UiDropdownItem>
                            <UiDropdownItem @click="moveDownOption('acceptedTypes', index)">
                                <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                            </UiDropdownItem>
                            <UiDropdownItem @click="removeNovaData('acceptedTypes', index)">
                                <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                            </UiDropdownItem>
                        </UiOptionsDropdown>
                    </div>
                    
                    <div>
                        <UiSmallButton @click="newNovaOption('acceptedTypes')">
                            <span class="flex items-center">
                                <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Type
                            </span>
                        </UiSmallButton>
                    </div>
                </div>
            </div>

            <div v-if="novaInputTypeIs('audio')">
                <UiText v-model="input.novaSettings.preload" label="Preload" @change="saveInput()" />
            </div>

            <div v-if="input.isSelect() && !novaInputTypeIs('textarea')">
                <UiText v-model="input.novaSettings.withFiles" label="With Files" @change="saveInput()" />
            </div>

            <div v-if="novaInputTypeIs('code')">
                <UiSelect v-model="input.novaSettings.language" label="Language" @change="saveInput()">
                    <template v-for="language in getSupportedInputNovaLanguages()">
                        <option :value="language">{{ capitalCase(language) }}</option>
                    </template>
                </UiSelect>
            </div>

            <div v-if="novaInputTypeIs('markdown')">
                <UiSelect v-model="input.novaSettings.preset" label="Preset" @change="saveInput()">
                    <option value="default">Default</option>
                    <option value="commonmark">Commonmark</option>
                    <option value="zero">Zero</option>
                </UiSelect>
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('boolean-group')">
                <UiText v-model="input.novaSettings.noValueText" label="No Value Text" @change="saveInput()" />
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('textarea')">
                <UiNumber v-model="input.novaSettings.rows" label="Rows" @change="saveInput()" />
            </div>

            <div class="grid grid-cols-2 gap-4" v-if="novaInputTypeIs('boolean')">
                <div>
                    <UiText v-model="input.novaSettings.falseValue" label="False Value" @change="saveInput()" />
                </div>
                <div>
                    <UiText v-model="input.novaSettings.trueValue" label="True Value" @change="saveInput()" />
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4" v-if="input.isNumber() || novaInputTypeIs('currency')">
                <div>
                    <UiNumber v-model="input.novaSettings.min" label="Min" @change="saveInput()" />
                </div>
                <div>
                    <UiNumber v-model="input.novaSettings.max" label="Max" @change="saveInput()" />
                </div>
                <div>
                    <UiNumber v-model="input.novaSettings.step" label="Step" @change="saveInput()" />
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4" v-if="novaInputTypeIs('slug')">
                <div>
                    <UiText v-model="input.novaSettings.from" label="From" @change="saveInput()" />
                </div>
                <div>
                    <UiText v-model="input.novaSettings.separator" label="Separator" @change="saveInput()" />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4" v-if="novaInputTypeIs('currency')">
                <div>
                    <UiText v-model="input.novaSettings.currency" label="Currency" @change="saveInput()" />
                </div>
                <div>
                    <UiText v-model="input.novaSettings.locale" label="Locale" @change="saveInput()" />
                </div>
            </div>

            <div v-if="novaInputTypeIs(['text', 'number'])">
                <UiSelect v-model="input.novaSettings.textAlign" label="Text Align" @change="saveInput()">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </UiSelect>
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('text')">
                <div>
                    <UiNumber v-model="input.novaSettings.maxLength" label="Max Length" @change="saveInput()" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs text-slate-400">Suggestions</label>

                    <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.novaSettings.suggestions">
                        <UiText v-model="input.novaSettings.suggestions[index]" @input="saveInput()" />

                        <UiOptionsDropdown>
                            <UiDropdownItem @click="moveUpOption('suggestions', index)">
                                <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                            </UiDropdownItem>
                            <UiDropdownItem @click="moveDownOption('suggestions', index)">
                                <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                            </UiDropdownItem>
                            <UiDropdownItem @click="removeNovaData('suggestions', index)">
                                <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                            </UiDropdownItem>
                        </UiOptionsDropdown>
                    </div>
                    
                    <div>
                        <UiSmallButton @click="newNovaOption('suggestions')">
                            <span class="flex items-center">
                                <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Option
                            </span>
                        </UiSmallButton>
                    </div>
                </div>
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('badge')">
                <div>
                    <UiText v-model="input.novaSettings.label" label="Label" @change="saveInput()" />
                </div>

                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-xs text-slate-400">Labels</label>
                    </div>

                    <div class="max-h-[300px] overflow-y-auto">
                        <template v-for="(option, index) in input.novaSettings.labels" :key="index">
                            <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyPropertyData('labels')">
                                <div class="w-2/4">
                                    <UiText v-model="option.value" placeholder="Label Value" @input="saveInput()" />
                                </div>
                                <div class="w-2/4">
                                    <UiText v-model="option.label" placeholder="Label Name" @input="saveInput()" />
                                </div>
                                <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeNovaData('labels', index)" />
                            </div>
                        </template>
                    </div>

                    <UiSmallButton @click="addItemForProperty('labels')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="w-5 h-5 mr-1" />
                            Add Label
                        </span>
                    </UiSmallButton>
                </div>

                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-xs text-slate-400">Maps</label>
                    </div>

                    <div class="max-h-[300px] overflow-y-auto">
                        <template v-for="(option, index) in input.novaSettings.map" :key="index">
                            <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyPropertyData('map')">
                                <div class="w-2/4">
                                    <UiText v-model="option.value" placeholder="Value" @input="saveInput()" />
                                </div>
                                <div class="w-2/4">
                                    <UiText v-model="option.label" placeholder="Label" @input="saveInput()" />
                                </div>
                                <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeNovaData('map', index)" />
                            </div>
                        </template>
                    </div>

                    <UiSmallButton @click="addItemForProperty('map')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="w-5 h-5 mr-1" />
                            Add Map
                        </span>
                    </UiSmallButton>
                </div>

                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-xs text-slate-400">Types</label>
                    </div>

                    <div class="max-h-[300px] overflow-y-auto">
                        <template v-for="(option, index) in input.novaSettings.types" :key="index">
                            <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyPropertyData('types')">
                                <div class="w-2/4">
                                    <UiText v-model="option.value" placeholder="Value" @input="saveInput()" />
                                </div>
                                <div class="w-2/4">
                                    <UiText v-model="option.label" placeholder="Label" @input="saveInput()" />
                                </div>
                                <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeNovaData('types', index)" />
                            </div>
                        </template>
                    </div>

                    <UiSmallButton @click="addItemForProperty('types')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="w-5 h-5 mr-1" />
                            Add Type
                        </span>
                    </UiSmallButton>
                </div>

                <div>
                    <div class="flex justify-between mb-2">
                        <label class="text-xs text-slate-400">Additional Types</label>
                    </div>

                    <div class="max-h-[300px] overflow-y-auto">
                        <template v-for="(option, index) in input.novaSettings.addTypes" :key="index">
                            <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyPropertyData('addTypes')">
                                <div class="w-2/4">
                                    <UiText v-model="option.value" placeholder="Value" @input="saveInput()" />
                                </div>
                                <div class="w-2/4">
                                    <UiText v-model="option.label" placeholder="Label" @input="saveInput()" />
                                </div>
                                <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeNovaData('addTypes', index)" />
                            </div>
                        </template>
                    </div>

                    <UiSmallButton @click="addItemForProperty('addTypes')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="w-5 h-5 mr-1" />
                            Add Type
                        </span>
                    </UiSmallButton>
                </div>
                
                <div>
                    <UiCheckbox v-model="input.novaSettings.withIcons" label="With Icons" @change="saveInput()" />
                </div>
                
                <div v-if="input.novaSettings.withIcons">
                    <div class="flex justify-between mb-2">
                        <label class="text-xs text-slate-400">Icons</label>
                    </div>
                    <div class="max-h-[300px] overflow-y-auto">
                        <template v-for="(option, index) in input.novaSettings.icons" :key="index">
                            <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyPropertyData('icons')">
                                <div class="w-2/4">
                                    <UiText v-model="option.value" placeholder="Label Value" @input="saveInput()" />
                                </div>
                                <div class="w-2/4">
                                    <UiText v-model="option.icon" placeholder="Label Name" @input="saveInput()" />
                                </div>
                                <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="removeNovaData('icons', index)" />
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
            </div>
            
            <div>
                <UiCheckbox v-model="input.novaSettings.readonly" label="Readonly" @change="saveInput()" />
            </div>

            <div>
                <UiCheckbox v-model="input.novaSettings.sortable" label="Sortable" @change="saveInput()" />
            </div>

            <div v-if="input.isTextarea()">
                <UiCheckbox v-model="input.novaSettings.alwaysShow" label="Always Show" @change="saveInput()" />
            </div>

            <div v-if="novaInputTypeIs(['multi-select', 'select'])">
                <UiCheckbox v-model="input.novaSettings.displayUsingLabels" label="Display using Labels" @change="saveInput()" />
            </div>

            <div v-if="(input.isSelect() || input.isBelongsTo()) && !novaInputTypeIs('badge')">
                <UiCheckbox v-model="input.novaSettings.searchable" label="Searchable?" @change="saveInput()" />
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('text')">
                <div>
                    <UiCheckbox v-model="input.novaSettings.asHtml" label="As Html" @change="saveInput()" />
                </div>

                <div>
                    <UiCheckbox v-model="input.novaSettings.copyable" label="Copyable" @change="saveInput()" />
                </div>

                <div>
                    <UiCheckbox v-model="input.novaSettings.enforceMaxLength" label="Enforce Max Length" @change="saveInput()" />
                </div>
            </div>

            <div>
                <UiCheckbox v-model="input.novaSettings.fullWidth" label="Full Width" @change="saveInput()" />
            </div>

            <div v-if="input.isCommon()">
                <UiCheckbox v-model="input.novaSettings.filterable" label="Filterable?" @change="saveInput()" />
            </div>

            <div v-if="novaInputTypeIs('code')">
                <UiCheckbox v-model="input.novaSettings.isJson" label="Is Json?" @change="saveInput()" />
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('avatar')">
                <div>
                    <UiCheckbox v-model="input.novaSettings.squared" label="Squared" @change="saveInput()" />
                </div>
                <div>
                    <UiCheckbox v-model="input.novaSettings.rounded" label="Rounded" @change="saveInput()" />
                </div>
            </div>

            <div class="space-y-4" v-if="novaInputTypeIs('boolean-group')">
                <div>
                    <UiCheckbox v-model="input.novaSettings.hideFalseValues" label="Hide False Values" @change="saveInput()" />
                </div>
                <div>
                    <UiCheckbox v-model="input.novaSettings.hideTrueValues" label="Hide True Values" @change="saveInput()" />
                </div>
            </div>

            <div class="space-y-4" v-if="input.isFileOrImage()">
                <div v-if="novaInputTypeIs('file')">
                    <UiCheckbox v-model="input.novaSettings.disableDownload" label="Disable Downloads" @change="saveInput()" />
                </div>

                <div>
                    <UiCheckbox v-model="input.novaSettings.deletable" label="Deletable?" @change="saveInput()" />
                </div>

                <div>
                    <UiCheckbox v-model="input.novaSettings.prunable" label="Prunable?" @change="saveInput()" />
                </div>
            </div>
        </div>
    </div>
</template>