<script lang="ts" setup>
    import { ChevronDownIcon } from '@heroicons/vue/24/outline';
    import { defineProps, ref, onMounted, computed, nextTick, defineEmits, watch } from 'vue'

    type Options = {
        key: string,
        label: string
        description?: string
    }

    const props = defineProps({
            modelValue: {
                type: String,
                required: true
            },
            mayOpen: {
                type: Boolean,
                required: false
            },
            options: {
                type: Array<Options>,
                required: true
            },
            placeholder: {
                type: String,
                required: false
            },
            small: {
                type: Boolean,
                required: false
            },
            label: {
                type: String,
                required: false
            }
        }),
        emit = defineEmits(['input', 'change', 'update:modelValue'])

    const search = ref(''),
        showing = ref(false),
        selected = ref(null),
        selectCandidate = ref(null),
        recentlyFocused = ref(false),
        selectCandidateOption = ref(null),
        selectButton = ref(null),
        searchInput = ref(null),
        selectedOption = ref(null),
        dropdownList = ref(null),
        filteredOptions = computed(() => {
            if(search.value) {
                return props.options.filter(option => option.label.toLowerCase().includes(search.value.toLowerCase()))
            }

            return props.options
        })

    const getInitiallySelected = () => {
        if(props.modelValue) {
            return props.options.find(option => option.key == props.modelValue)
        }

        return null
    }

    const keyPressed = (event: any): void => {
        const selectedIndex: number = getSelectedIndex()

        let nextItem: Options = null,
            itemIndex: number = selectedIndex

        if (event.keyCode == 38) {
            itemIndex -= 1

            if(itemIndex < 0) itemIndex = filteredOptions.value.length - 1

            nextItem = filteredOptions.value[itemIndex]
        }

        if (event.keyCode == 40) {
            itemIndex += 1

            if(itemIndex >= filteredOptions.value.length) itemIndex = 0

            nextItem = filteredOptions.value[itemIndex]
        }

        if(!nextItem) return

        selectCandidate.value = nextItem
        scrollToSelectCandidateItem()
    }

    const getSelectedIndex = (): number => {
        if(selectCandidate.value) {
            return filteredOptions.value.findIndex(option => option.key == selectCandidate.value.key)
        }

        if(selected.value) {
            return filteredOptions.value.findIndex(option => option.key == selected.value.key)
        }

        return -1
    }

    const scrollToSelectCandidateItem = (): void => {
        const selected = selectCandidateOption.value

        if(!selected || !showing.value) {
            return scrollToSelectedItem()
        }

        dropdownList.value.scrollTop = selected[0].offsetTop - (selected[0].clientHeight + 60)
    }

    const scrollToSelectedItem = (): void => {
        const selected = selectedOption.value

        if(!selected || !showing.value) return

        dropdownList.value.scrollTop = selected[0].offsetTop - (selected[0].clientHeight + 60)
    }

    const isSelected = (option: Options): boolean => {
        if(selected.value) {
            return selected.value.key == option.key
        }

        return false
    }

    const isSelectCandidate = (option: Options): boolean => {
        if(selectCandidate.value) {
            return selectCandidate.value.key == option.key
        }

        return false
    }

    const selectCurrentCandidate = (): void => {
        if(selectCandidate.value) {
            select(selectCandidate.value)
        }
    }

    const select = (option: Options): void => {
        selected.value = option
        close()

        emit('update:modelValue', selected.value.key)
        emit('input', selected.value.key)
        emit('change')
    }

    const focusFiredOnce = (): void => {
        if(selected.value) return

        focusFired()
    }

    const focusFired = (): void => {
        if(recentlyFocused.value) return

        recentlyFocused.value = true

        toggle()

        setTimeout(() => {
            recentlyFocused.value = false
        }, 300)
    }

    const open = (): void => {
        showing.value = true
    }

    const toggle = (): void => {
        showing.value = !showing.value

        nextTick(() => scrollToSelectedItem())
    }

    const optionReference = (option: Options): string => {
        if(isSelected(option)) {
            return 'selectedOption'
        }

        if(isSelectCandidate(option)) {
            return 'selectCandidateOption'
        }

        return ''
    }

    const close = (): void => {
        search.value = ''
        showing.value = false
        selectCandidate.value = false
        recentlyFocused.value = false
    }

    watch(showing, () => {
        nextTick(() => {
            searchInput.value.focus()
        })
    })

    watch(() => props.modelValue, () => {
        selected.value = getInitiallySelected()
    })

    watch(() => props.mayOpen, (value) => {
        if(!value) return

        setTimeout(() => {
            open()
        }, 100)
    })

    watch(() => props.options, () => {
        selected.value = getInitiallySelected()
    })

    watch(search, (newValue: string) => {
        let itemBySearch = props.options.find(opt => opt.label.toLowerCase() === newValue.toLowerCase())

        selectCandidate.value = itemBySearch
    })

    onMounted(() => {
        selected.value = getInitiallySelected()

        if(props.mayOpen) {
            nextTick(() => {
                open()
            })
        }
    })
</script>
<template>
    <div class="relative text-slate-600 dark:text-white"
        @keyup="keyPressed"
        @keyup.esc="close()"
        @keyup.enter="selectCurrentCandidate()"
        v-click-outside="close"
    >
        <span class="text-xs text-slate-400" v-if="label">{{ label }}</span>
        <button
            ref="selectButton"
            class="flex focus:border-red-500 border border-slate-650 items-center justify-between bg-white dark:bg-slate-950 appearance-none rounded-lg leading-tight text-slate-600 dark:text-slate-300 dark:focus:text-slate-200 py-1.5 px-2 w-full outline-none"
            :class="{ 'active': showing, 'p-2': !small }"
            :title="selected ? selected.label : placeholder"
            @focus="focusFiredOnce()"
            @click="focusFired()"
        >
            <div class="text-left w-10/12 overflow-hidden whitespace-nowrap">
                <span v-if="selected">{{ selected.label }}</span>
                <span class="text-slate-500" v-else>{{ placeholder }}</span>
            </div>
            <div class="flex justify-end">
                <ChevronDownIcon class="w-4 h-4 ml-1" />
            </div>
        </button>
        
        <div
            v-show="showing"
            class="bg-white dark:bg-slate-950 rounded-lg shadow-lg my-2 left-0 absolute overflow-hidden"
            style="min-width: 225px; width: 100%; max-height: 300px; z-index: 999"
        >
            <div class="relative">
                <div class="p-2" style="height: 60px">
                    <input ref="searchInput" class="focus:border focus:border-red-500 rounded leading-tight bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1 px-1 w-full border-2 border-transparent outline-none" placeholder="Search..." v-model="search">
                </div>
                <ul ref="dropdownList" class="list-reset h-full overflow-y-auto" style="max-height: 240px;">
                    <li :ref="optionReference(option)" v-for="(option, index) in filteredOptions" :key="index">
                        <p
                            class="p-2 flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            :class="{ 'bg-slate-200 dark:bg-slate-800': isSelected(option), 'bg-slate-200 dark:bg-slate-600 border border-slate-300': isSelectCandidate(option) }"
                            @click="select(option)"
                        >
                            <span>
                                <span class="block">{{ option.label }}</span>
                                <span class="block text-sm text-slate-500" v-if="option.description">{{ option.description }}</span>
                            </span>
                            <span v-if="isSelected(option)">
                                <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="w-4 h-4"><path d="M5 13l4 4L19 7"></path></svg>
                            </span>
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
