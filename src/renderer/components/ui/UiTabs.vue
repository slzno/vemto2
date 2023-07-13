<script setup lang="ts">
    import { ref, defineProps, defineEmits, onMounted } from 'vue'

    let localValue = ref(null)

    const props = defineProps({
        modelValue: {
            type: String,
            required: true,
        },

        tabs: {
            type: Array<{label: string, value: string, badge?: string | Function}>,
            required: true,
        },

        external: {
            type: Boolean,
            default: false,
        },
    })

    const emit = defineEmits(['update:modelValue'])

    onMounted((): void => {
        localValue.value = props.modelValue

        const lastSelectedTab = localStorage.getItem('lastSelectedTab')

        if (lastSelectedTab && props.tabs.find((tab) => tab.value === lastSelectedTab)) {
            localValue.value = lastSelectedTab
            emit('update:modelValue', lastSelectedTab)
        }
    })

    const setTab = (value: string): void => {
        localValue.value = value
        emit('update:modelValue', value)

        localStorage.setItem('lastSelectedTab', value)
    }
</script>

<template>
    <ul
        :class="{
            'bg-slate-800': !external,
            'bg-transparent': external,
        }"
        class="flex space-x-2 text-sm text-slate-500 px-1 border-b border-slate-700 select-none"
    >
        <li
            v-for="tab in tabs"
            :key="tab.value"
            @click="setTab(tab.value)"
            class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-300 border-l border-t border-r flex items-center space-x-2"
            :class="{
                'bg-slate-850': !external && tab.value === localValue,
                'bg-slate-900': external && tab.value === localValue,
                'border-transparent': tab.value !== localValue,
                'text-slate-300 border-slate-700': tab.value === localValue
            }"
        >
            <div>{{ tab.label }}</div>

            <div class="flex items-center justify-center h-4 w-5 text-xs border text-slate-500 border-slate-700 rounded" v-if="(typeof tab.badge !== 'undefined')">
                {{ (typeof tab.badge === 'function') ? tab.badge() : tab.badge }}
            </div>
        </li>
    </ul>
</template>
