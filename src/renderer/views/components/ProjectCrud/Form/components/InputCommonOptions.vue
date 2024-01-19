<script setup lang="ts">
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { PlusCircleIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import { toRef, defineProps } from 'vue'
    import Input from "@Common/models/crud/Input"
    import debounce from "@Common/tools/debounce"
    import { capitalCase } from "change-case"
    
    const props = defineProps({
            input: Input
        }),
        input = toRef(props, "input")

    const saveInput = debounce(() => {
        input.value.save()
    }, 500);

    const addItem = () => {
        input.value.items.push({
            value: "",
            label: ""
        })
    }

    const deleteItem = (deleteItem: any) => {
        input.value.items.splice(input.value.items.indexOf(deleteItem), 1)
    }

    const removeEmptyItems = () => {
        input.value.items = input.value.items.filter(item => item.value !== "" || item.label !== "")

        saveInput()
    }

    const onItemKeyChanged = (item: any) => {
        if(!item.label.length) {
            item.label = capitalCase(item.value)
        }
        
        saveInput()
    }
</script>
<template>
    <div class="flex-grow overflow-auto pb-40">
        <div class="p-4 space-y-4">
            <UiText v-model="input.name" placeholder="Input Name" disabled label="Name" @input="saveInput()" />

            <UiText v-model="input.label" placeholder="Input Label" label="Label" @input="saveInput()" />
            
            <div v-if="input.allowsPlaceholder()">
                <UiText v-model="input.placeholder" placeholder="Input Placeholder" label="Placeholder" @input="saveInput()" />
            </div>

            <div v-if="input.allowsDefaultValue()">
                <UiText v-model="input.defaultValue" placeholder="Input Default Value" label="Default Value" @input="saveInput()" />
            </div>

            <div v-if="input.allowsMinimumLength()">
                <UiNumber v-model="input.min" placeholder="Input Minimum Length" label="Minimum Length" @input="saveInput()" />
            </div>

            <div v-if="input.allowsMaximumLength()">
                <UiNumber v-model="input.max" placeholder="Input Maximum Length" label="Maximum Length" @input="saveInput()" />
            </div>

            <div v-if="input.allowsStep()">
                <UiNumber v-model="input.step" placeholder="Input Step" label="Step" @input="saveInput()" />
            </div>

            <div v-if="input.allowsItems()">
                <div class="flex justify-between">
                    <label class="text-xs text-slate-400">Items</label>

                    <div>
                        <UiOptionsDropdown>
                            <UiDropdownItem @click="input.resetItemsFromColumn()">Reset from Column Options</UiDropdownItem>
                        </UiOptionsDropdown>
                    </div>
                </div>

                <div class="max-h-[300px] overflow-y-auto">
                    <template v-for="(item, index) in input.items" :key="index">
                        <div class="flex gap-2 my-1 justify-center items-center" @keyup.esc="removeEmptyItems()">
                            <div class="w-2/4">
                                <UiText v-model="item.value" placeholder="Item Value" @blur="onItemKeyChanged(item)" @input="saveInput()" />
                            </div>
                            <div class="w-2/4">
                                <UiText v-model="item.label" placeholder="Item Label" @input="saveInput()" />
                            </div>
                            <TrashIcon class="w-5 h-5 text-red-400 hover:text-red-500 cursor-pointer" @click="deleteItem(item)" />
                        </div>
                    </template>
                </div>

                <UiSmallButton @click="addItem()">
                    <span class="flex items-center">
                        <PlusCircleIcon class="w-5 h-5 mr-1" />
                        Add Item
                    </span>
                </UiSmallButton>
            </div>

            <div class="mt-2 flex gap-2 flex-col">
                <UiCheckbox v-model="input.showOnCreation" label="On Create" @input="saveInput()" />

                <UiCheckbox v-model="input.showOnUpdate" label="On Update" @input="saveInput()" />

                <UiCheckbox v-model="input.showOnDetails" label="On Details" @input="saveInput()" />

                <UiCheckbox v-model="input.showOnIndex" label="On Index" @input="saveInput()" />
            </div>
        </div>
    </div>
</template>