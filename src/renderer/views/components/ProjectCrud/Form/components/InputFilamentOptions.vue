<script setup lang="ts">
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiDate from "@Renderer/components/ui/UiDate.vue"
    import { PlusCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import { toRef, defineProps } from 'vue'
    import Input from "@Common/models/crud/Input"
    import debounce from "@Common/tools/debounce"
    import Main from "@Renderer/services/wrappers/Main"
    import { InputType } from "@Common/models/crud/InputType"
    
    const props = defineProps({
            input: Input
        }),
        input = toRef(props, "input")

    const saveInput = debounce(() => {
        input.value.save()
    }, 500);

    const inputFilamentTypeIs = (type: string | string[]) => {
        if(!Array.isArray(type)) type = [type]

        return type.includes(input.value.filamentData.inputType)
    }

    const removeDatalistOption = (index: number) => {
        Main.API.confirm('Are you sure you want to remove this option?').then(confirmed => {
            if(!confirmed) return

            input.value.filamentData.dataList.splice(index, 1)
            saveInput()
        })
    }

    const removeDisabledDateOption = (index: number) => {
        Main.API.confirm('Are you sure you want to remove this date?').then(confirmed => {
            if(!confirmed) return

            input.value.filamentData.disabledDates.splice(index, 1)
            saveInput()
        })
    }

    const newDatalistOption = () => {
        if(!input.value.filamentData.dataList) input.value.filamentData.dataList = []

        input.value.filamentData.dataList.push('')
    }

    const newDisabledDateOption = () => {
        if(!input.value.filamentData.disabledDates) input.value.filamentData.disabledDates = []

        input.value.filamentData.disabledDates.push('')
    }
</script>
<template>
    <div class="flex-grow overflow-auto pb-40">
        <div class="p-4 space-y-4">
            <div>
                <UiText v-model="input.filamentData.helperText" placeholder="Input Helper Text" label="Helper Text" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('select')">
                <UiText v-model="input.filamentData.loadingMessage" placeholder="Message while the options are loading" label="Loading Message" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('select')">
                <UiText v-model="input.filamentData.noResultMessage" placeholder="Shown when there are no results" label="No Results Message" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('select')">
                <UiText v-model="input.filamentData.searchMessage" placeholder="Shown when the search field is empty" label="Search Message" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker', 'time-picker'])">
                <UiText v-model="input.filamentData.timezone" placeholder="Timezone" label="Timezone" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker', 'time-picker'])">
                <UiText v-model="input.filamentData.dateFormat" placeholder="Date format for storing" label="Date Format" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker', 'time-picker'])">
                <UiText v-model="input.filamentData.displayFormat" placeholder="Date format for display" label="Display Form" @input="saveInput()" />
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs(['text-input', 'datetime-picker', 'date-picker'])">
                <label class="text-xs text-slate-400">Datalist</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentData.dataList">
                    <component :is="inputFilamentTypeIs('text-input') ? UiText : UiDate" v-model="input.filamentData.dataList[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="removeDatalistOption(index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newDatalistOption()">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Option
                        </span>
                    </UiSmallButton>
                </div>
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker'])">
                <label class="text-xs text-slate-400">Disabled Dates</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentData.disabledDates">
                    <UiDate v-model="input.filamentData.disabledDates[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="removeDisabledDateOption(index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newDisabledDateOption()">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Date
                        </span>
                    </UiSmallButton>
                </div>
            </div>
            
            <div class="mt-2 flex gap-2 flex-col">
                <UiCheckbox v-model="input.filamentData.autofocus" label="Auto Focus" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs('text-input')" v-model="input.filamentData.autoComplete" label="Auto Complete" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs('select')" v-model="input.filamentData.allowHtml" label="Allow HTML in option labels" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs('select')" v-model="input.filamentData.isMultiple" label="Allow selecting multiple values" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs('select')" v-model="input.filamentData.canSelectPlaceholder" label="Allow select the placeholder" @input="saveInput()" />
                
                <UiCheckbox v-if="input.type === InputType.BELONGS_TO && inputFilamentTypeIs('select')" v-model="input.filamentData.canBePreloaded" label="Preload relationship options" @input="saveInput()" />
                
                <UiCheckbox v-if="inputFilamentTypeIs(['checkbox', 'radio'])" v-model="input.filamentData.inline" label="Inline Component" @input="saveInput()" />
                
                <UiCheckbox v-if="inputFilamentTypeIs('radio')" v-model="input.filamentData.inlineLabel" label="Inline Label" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['select', 'datetime-picker', 'date-picker', 'time-picker'])" v-model="input.filamentData.useCustomInput" label="Use custom input (not HTML5)" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['datetime-picker', 'time-picker'])" v-model="input.filamentData.disableSeconds" label="Disable seconds on input" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['datetime-picker', 'date-picker', 'time-picker'])" v-model="input.filamentData.closeOnDateSelection" label="Close on date selection" @input="saveInput()" />
            </div>
        </div>
    </div>
</template>