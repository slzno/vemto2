<script lang="ts" setup>
    import { defineProps, ref, onMounted, computed, nextTick, defineEmits } from 'vue'

    type Options = {
        key: string,
        label: string
    }

    const props = defineProps({
            value: {
                type: String,
                required: true
            },
            options: {
                type: Array<Options>,
                required: true
            },
            placeholder: {
                type: String,
                required: false
            },
            notSmall: {
                type: Boolean,
                required: false
            }
        }),
        emit = defineEmits(['input', 'change'])

    const search = ref(''),
        showing = ref(false),
        selected = ref(null),
        selectCandidate = ref(null),
        recentlyFocused = ref(false),
        hasNormalInputSize = ref(false),
        selectCandidateOption = ref(null),
        selectButton = ref(null),
        selectedOption = ref(null),
        dropdownList = ref(null),
        filteredOptions = computed(() => {
            if(search.value) {
                return props.options.filter(option => option.label.toLowerCase().includes(search.value))
            }

            return props.options
        })

    const getInitiallySelected = () => {
        if(props.value) {
            return props.options.find(option => option.key == props.value)
        }

        return null
    }

    const keyPressed = (event): void => {
        const selectedIndex: number = getSelectedIndex()

        let nextItem = null

        if (event.keyCode == 38) {
            let itemIndex = selectedIndex - 1

            if(itemIndex < 0) itemIndex = filteredOptions.value.length - 1

            nextItem = filteredOptions.value[itemIndex]
        }

        if (event.keyCode == 40) {
            let itemIndex = selectedIndex + 1

            if(itemIndex >= filteredOptions.value.length) itemIndex = 0

            nextItem = filteredOptions.value[itemIndex]
        }

        if(!nextItem) return

        selectCandidate.value = nextItem
        scrollToSelectCandidateItem()
    }

    const getSelectedIndex = (): number => {
        if(selectCandidate.value) {
            return filteredOptions.value.indexOf(selectCandidate.value)
        }

        if(selected.value) {
            return filteredOptions.value.indexOf(selected.value)
        }

        return -1
    }

    const scrollToSelectCandidateItem = (): void => {
        const selected = selectCandidateOption.value

        if(!selected || !showing.value) {
            return scrollToSelectedItem()
        }

        dropdownList.value.scrollTop = selected.offsetTop - (selected.clientHeight + 60)
    }

    const scrollToSelectedItem = (): void => {
        const selected = selectedOption.value

        if(!selected || !showing.value) return

        dropdownList.value.scrollTop = selected.offsetTop - (selected.clientHeight + 60)
    }

    const isSelected = (option: string): boolean => {
        if(selected.value) {
            return selected.value == option
        }

        return false
    }

    const isSelectCandidate = (option: string): boolean => {
        if(selectCandidate.value) {
            return selectCandidate.value == option
        }

        return false
    }

    const selectCurrentCandidate = (): void => {
        if(selectCandidate.value) {
            select(selectCandidate.value)
        }
    }

    const select = (option): void => {
        selected.value = option
        close()

        emit('input', selected.value.key)
        emit('change')
    }

    const focus = (): void => {
        selectButton.value.focus()
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

    const optionReference = (option: string): string => {
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

    onMounted(() => {
        selected.value = getInitiallySelected()
        hasNormalInputSize.value = props.notSmall
    })
</script>
<template>
    <div class="relative text-gray-600 dark:text-white" @keyup="keyPressed" @keyup.esc="close()">
        
    </div>
</template>
