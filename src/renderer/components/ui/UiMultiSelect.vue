<script lang="ts" setup>
    import Main from '@Renderer/services/wrappers/Main'
    import { XMarkIcon } from '@heroicons/vue/24/outline'
    import Multiselect from '@vueform/multiselect/dist/multiselect.js'
    import { defineProps, computed } from 'vue'

    const props = defineProps({
            options: {
                type: Array,
                required: true
            },
            placeholder: {
                type: String,
                default: 'Please, select an option'
            },
            closeOnSelect: {
                type: Boolean,
                default: false
            },
            inputLabel: {
                type: String,
                default: 'inputLabel',
            },
            searchable: {
                type: Boolean,
                default: true
            },
            defaultValue: {
                type: Array,
                default: () => []
            }
        })

    const clearList = (callbackClearFunction: Function): void => {
        Main.API.confirm('Are you sure you want to clear the list?').then(confirmed => {
            if(!confirmed) return

            callbackClearFunction()
        })
    }
        
    const emit = defineEmits(["change"]),
        localValue = computed({
            get() {
                return props.defaultValue
            },
            set(value) {
                emit("change", value)
            }
        })
</script>
<template>
    <div>
        <span class="text-xs text-slate-400" v-if="inputLabel">{{ inputLabel }}</span>
        <Multiselect
            v-model="localValue"
            mode="tags"
            :close-on-select="closeOnSelect"
            :options="options"
            :create-option="true"
            :object="true"
            :searchable="searchable"
            :placeholder="placeholder"
            :classes="{
                container: 'relative mx-auto w-full flex items-center justify-end box-border cursor-pointer border border-gray-300 dark:border-slate-950 rounded text-base leading-snug outline-none dark:bg-slate-950',
                containerOpen: 'rounded-t-none',
                tag: 'bg-red-500 text-white text-sm font-semibold py-0.5 pl-2 rounded mr-1 mb-1 flex items-center whitespace-nowrap rtl:pl-0 rtl:pr-2 rtl:mr-0 rtl:ml-1',
                tagRemove: 'flex items-center justify-center p-1 mx-0.5 rounded-sm hover:bg-red-300 hover:bg-opacity-25 group',
                option: 'flex items-center w-full justify-start box-border text-left cursor-pointer text-base leading-snug py-2 px-3',
                tagsSearch: 'absolute inset-0 border-0 outline-none focus:ring-0 appearance-none p-0 dark:bg-transparent text-base font-sans box-border w-full',
                placeholder: 'flex items-center h-full text-sm absolute left-0 top-0 pointer-events-none bg-white dark:bg-slate-950 dark:text-white leading-snug pl-3.5 text-black rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3.5',
                dropdown: 'max-h-60 absolute -left-px -right-px bottom-0 transform translate-y-full border border-gray-300 dark:border-none -mt-px overflow-y-scroll z-50 bg-slate-950 flex flex-col rounded-b',
                dropdownTop: '-translate-y-full top-px bottom-auto rounded-b-none rounded-t',
                dropdownHidden: 'hidden',
                optionPointed: 'text-white bg-slate-800',
            }"
        >
            <template #clear="{ clear }">
                <span role="button" tabindex="0" aria-label="❎" @click.stop="clearList(clear)" @keyup.enter="clearList(clear)">
                    <XMarkIcon class="w-4 h-4 mr-2"  />
                </span>
            </template>
        </Multiselect>
    </div>
</template>