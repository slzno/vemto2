<script setup lang="ts">
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import UiDate from "@Renderer/components/ui/UiDate.vue"
    import { PlusCircleIcon, TrashIcon, ArrowLongUpIcon, ArrowLongDownIcon } from "@heroicons/vue/24/outline"
    import { toRef, defineProps } from 'vue'
    import Input from "@Common/models/crud/Input"
    import debounce from "@Common/tools/debounce"
    import { InputType } from "@Common/models/crud/InputType"
    import FilamentInputTypesList from "@Common/models/crud/filament/FilamentInputTypesList"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import { capitalCase } from "change-case"
    
    const props = defineProps({
            input: Input
        }),
        input = toRef(props, "input")

    const saveInput = debounce(() => {
        input.value.save()
    }, 500);

    const inputFilamentTypeIs = (type: string | string[]) => {
        if(!Array.isArray(type)) type = [type]

        return type.includes(input.value.filamentSettings.formData.inputType)
    }

    const removeFilamentOption = (propertyName: string, index: number) => {
        input.value.filamentSettings.formData[propertyName].splice(index, 1)
        saveInput()
    }

    const newFilamentOption = (propertyName: string) => {
        if(!input.value.filamentSettings.formData[propertyName]) input.value.filamentSettings.formData[propertyName] = []

        input.value.filamentSettings.formData[propertyName].push('')
    }

    const moveUpOption = (propertyName: string, index: number) => {
        if(index === 0) return

        const option = input.value.filamentSettings.formData[propertyName][index]
        input.value.filamentSettings.formData[propertyName].splice(index, 1)
        input.value.filamentSettings.formData[propertyName].splice(index - 1, 0, option)
        saveInput()
    }

    const moveDownOption = (propertyName: string, index: number) => {
        if(index === input.value.filamentSettings.formData[propertyName].length - 1) return

        const option = input.value.filamentSettings.formData[propertyName][index]
        input.value.filamentSettings.formData[propertyName].splice(index, 1)
        input.value.filamentSettings.formData[propertyName].splice(index + 1, 0, option)
        saveInput()
    }

    const openImageEditorModeDocumentation = () => {
        Main.API.openURL('https://github.com/fengyuanchen/cropperjs#viewmode')
    }

    const getFilamentTypeSuggestions = () => {
        return FilamentInputTypesList.getSuggestionsFromInputType(input.value.type)
    }
</script>
<template>
    <div class="flex-grow overflow-auto pb-40">
        <div class="p-4 space-y-4">
            <div>
                <UiSelect v-model="input.filamentSettings.formData.inputType" label="Input Type" @change="saveInput()">
                    <template v-for="suggestion in getFilamentTypeSuggestions()">
                        <option :value="suggestion">{{ capitalCase(suggestion) }}</option>
                    </template>
                </UiSelect>
            </div>

            <div>
                <UiText v-model="input.filamentSettings.formData.helperText" placeholder="Input Helper Text" label="Helper Text" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('select')">
                <UiText v-model="input.filamentSettings.formData.loadingMessage" placeholder="Message while the options are loading" label="Loading Message" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('select')">
                <UiText v-model="input.filamentSettings.formData.noResultMessage" placeholder="Shown when there are no results" label="No Results Message" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('select')">
                <UiText v-model="input.filamentSettings.formData.searchMessage" placeholder="Shown when the search field is empty" label="Search Message" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker', 'time-picker'])">
                <UiText v-model="input.filamentSettings.formData.timezone" placeholder="Timezone" label="Timezone" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker', 'time-picker'])">
                <UiText v-model="input.filamentSettings.formData.dateFormat" placeholder="Date format for storing" label="Date Format" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker', 'time-picker'])">
                <UiText v-model="input.filamentSettings.formData.displayFormat" placeholder="Date format for display" label="Display Form" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['file-upload', 'rich-editor', 'markdown-editor'])">
                <UiText v-model="input.filamentSettings.formData.disk" placeholder="Disk name" label="Disk" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['file-upload', 'rich-editor', 'markdown-editor'])">
                <UiText v-model="input.filamentSettings.formData.directory" placeholder="Directory name" label="Directory" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs('file-upload')">
                <UiText :disabled="!input.filamentSettings.formData.useImageEditor" v-model="input.filamentSettings.formData.imageEditorViewportWidth" placeholder="Width" label="Viewport Width (Image Editor)" @input="saveInput()" />
            </div>
            
            <div v-if="inputFilamentTypeIs('file-upload')">
                <UiText :disabled="!input.filamentSettings.formData.useImageEditor" v-model="input.filamentSettings.formData.imageEditorViewportHeight" placeholder="Height" label="Viewport Height (Image Editor)" @input="saveInput()" />
            </div>

            <div v-if="inputFilamentTypeIs(['file-upload', 'rich-editor', 'markdown-editor'])">
                <UiSelect v-model="input.filamentSettings.formData.visibility" label="Visibility" @change="saveInput()">
                    <option value="public">Public</option>  
                    <option value="private">Private</option>
                </UiSelect>
            </div>

            <div v-if="input.isTextarea()">
                <UiNumber :disabled="!inputFilamentTypeIs('textarea')" v-model="input.filamentSettings.formData.rows" placeholder="Rows" label="Textarea Rows" @input="saveInput()" />
            </div>

            <div v-if="input.isTextarea()">
                <UiNumber :disabled="!inputFilamentTypeIs('textarea')" v-model="input.filamentSettings.formData.cols" placeholder="Cols" label="Textarea Cols" @input="saveInput()" />
            </div>

            <div v-if="input.isTextarea()">
                <UiNumber :disabled="!inputFilamentTypeIs('textarea')" v-model="input.filamentSettings.formData.exactLength" placeholder="Exact Length" label="Textarea Exact Length" @input="saveInput()" />
            </div>
            
            <div v-if="inputFilamentTypeIs('file-upload')">
                <UiSelect :disabled="!input.filamentSettings.formData.useImageEditor" v-model="input.filamentSettings.formData.imageEditorMode" label="Image Editor Mode" @change="saveInput()">
                    <option :value="undefined">Default</option>  
                    <option value="0">No restrictions</option>  
                    <option value="1">Restrict the crop box not to exceed the size of the canvas</option>
                    <option value="2">Restrict the minimum canvas size to fit within the container</option>
                    <option value="3">Restrict the minimum canvas size to fill fit the container</option>
                </UiSelect>
                <small class="text-slate-400">
                    These options are explained in the
                    <b @click="openImageEditorModeDocumentation()" class="cursor-pointer underline underline-offset-2 decoration-red-400">Cropper.js documentation</b>
                </small>
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs(['text-input', 'datetime-picker', 'date-picker'])">
                <label class="text-xs text-slate-400">Datalist</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentSettings.formData.dataList">
                    <component :is="inputFilamentTypeIs('text-input') ? UiText : UiDate" v-model="input.filamentSettings.formData.dataList[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="moveUpOption('dataList', index)">
                            <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                        </UiDropdownItem>
                        <UiDropdownItem @click="moveDownOption('dataList', index)">
                            <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                        </UiDropdownItem>
                        <UiDropdownItem @click="removeFilamentOption('dataList', index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newFilamentOption('dataList')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Option
                        </span>
                    </UiSmallButton>
                </div>
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs(['date-picker', 'datetime-picker'])">
                <label class="text-xs text-slate-400">Disabled Dates</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentSettings.formData.disabledDates">
                    <UiDate v-model="input.filamentSettings.formData.disabledDates[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="moveUpOption('disabledDates', index)">
                            <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                        </UiDropdownItem>
                        <UiDropdownItem @click="moveDownOption('disabledDates', index)">
                            <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                        </UiDropdownItem>
                        <UiDropdownItem @click="removeFilamentOption('disabledDates', index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newFilamentOption('disabledDates')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Date
                        </span>
                    </UiSmallButton>
                </div>
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs('file-upload') && input.filamentSettings.formData.useImageEditor">
                <label class="text-xs text-slate-400">Aspect Ratios (Image Editor)</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentSettings.formData.imageEditorAspectRatios">
                    <UiText v-model="input.filamentSettings.formData.imageEditorAspectRatios[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="moveUpOption('imageEditorAspectRatios', index)">
                            <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                        </UiDropdownItem>
                        <UiDropdownItem @click="moveDownOption('imageEditorAspectRatios', index)">
                            <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                        </UiDropdownItem>
                        <UiDropdownItem @click="removeFilamentOption('imageEditorAspectRatios', index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newFilamentOption('imageEditorAspectRatios')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Ratio
                        </span>
                    </UiSmallButton>
                </div>
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs(['rich-editor', 'markdown-editor'])">
                <label class="text-xs text-slate-400">Toolbar Buttons</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentSettings.formData.toolbarButtons">
                    <UiText v-model="input.filamentSettings.formData.toolbarButtons[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="moveUpOption('toolbarButtons', index)">
                            <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                        </UiDropdownItem>
                        <UiDropdownItem @click="moveDownOption('toolbarButtons', index)">
                            <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                        </UiDropdownItem>
                        <UiDropdownItem @click="removeFilamentOption('toolbarButtons', index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newFilamentOption('toolbarButtons')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Toolbar Button
                        </span>
                    </UiSmallButton>
                </div>
            </div>

            <div class="flex flex-col gap-2" v-if="inputFilamentTypeIs(['rich-editor', 'markdown-editor'])">
                <label class="text-xs text-slate-400">Disabled Toolbar Buttons</label>

                <div class="flex-1 flex gap-2 items-center" v-for="(option, index) of input.filamentSettings.formData.disableToolbarButtons">
                    <UiText v-model="input.filamentSettings.formData.disableToolbarButtons[index]" @input="saveInput()" />

                    <UiOptionsDropdown>
                        <UiDropdownItem @click="moveUpOption('disableToolbarButtons', index)">
                            <ArrowLongUpIcon class="h-5 w-5 mr-1" /> Move Up
                        </UiDropdownItem>
                        <UiDropdownItem @click="moveDownOption('disableToolbarButtons', index)">
                            <ArrowLongDownIcon class="h-5 w-5 mr-1" /> Move Down
                        </UiDropdownItem>
                        <UiDropdownItem @click="removeFilamentOption('disableToolbarButtons', index)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
                
                <div>
                    <UiSmallButton @click="newFilamentOption('disableToolbarButtons')">
                        <span class="flex items-center">
                            <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Disabled Toolbar Button
                        </span>
                    </UiSmallButton>
                </div>
            </div>
            
            <div class="mt-2 flex gap-2 flex-col">
                <UiCheckbox v-if="!inputFilamentTypeIs('file-upload')" v-model="input.filamentSettings.formData.autofocus" label="Auto Focus" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs('textarea')" v-model="input.filamentSettings.formData.autosize" label="Autosize" @input="saveInput()" />

                <div class="flex gap-2 flex-col" v-if="inputFilamentTypeIs('file-upload')">
                    <UiCheckbox v-model="input.filamentSettings.formData.useAvatarMode" label="Enable avatar mode" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.canReorderFiles" label="Allow reorder files" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.useCircleCropper" label="Allow crop images as a circle" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.isDownloadable" label="Allow download files" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.canOpenFilesInNewTab" label="Allow open files in a new tab" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.disablePreview" label="Disable file preview" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.useImageEditor" label="Enable image editor" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.preserveFilenames" label="Preserve filenames" @input="saveInput()" />
                </div>

                <div class="flex gap-2 flex-col" v-if="inputFilamentTypeIs('select')">
                    <UiCheckbox v-model="input.filamentSettings.formData.allowHtml" label="Allow HTML in option labels" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.canSelectPlaceholder" label="Allow select the placeholder" @input="saveInput()" />

                    <UiCheckbox v-model="input.filamentSettings.formData.canBeSearchable" label="Allow search options" @input="saveInput()" />
                </div>

                <UiCheckbox v-if="inputFilamentTypeIs('text-input')" v-model="input.filamentSettings.formData.autoComplete" label="Auto Complete" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['select', 'file-upload'])" v-model="input.filamentSettings.formData.isMultiple" label="Allow selecting multiple" @input="saveInput()" />
                
                <UiCheckbox v-if="input.type === InputType.BELONGS_TO && inputFilamentTypeIs('select')" v-model="input.filamentSettings.formData.canBePreloaded" label="Preload relationship options" @input="saveInput()" />
                
                <UiCheckbox v-if="inputFilamentTypeIs(['checkbox', 'radio'])" v-model="input.filamentSettings.formData.inline" label="Inline Component" @input="saveInput()" />
                
                <UiCheckbox v-if="inputFilamentTypeIs('radio')" v-model="input.filamentSettings.formData.inlineLabel" label="Inline Label" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['select', 'datetime-picker', 'date-picker', 'time-picker'])" v-model="input.filamentSettings.formData.useCustomInput" label="Use custom input (not HTML5)" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['datetime-picker', 'time-picker'])" v-model="input.filamentSettings.formData.disableSeconds" label="Disable seconds on input" @input="saveInput()" />

                <UiCheckbox v-if="inputFilamentTypeIs(['datetime-picker', 'date-picker', 'time-picker'])" v-model="input.filamentSettings.formData.closeOnDateSelection" label="Close on date selection" @input="saveInput()" />
            </div>
        </div>
    </div>
</template>