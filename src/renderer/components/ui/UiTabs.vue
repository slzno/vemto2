<script setup lang="ts">
    import { ref, defineProps, defineEmits, onMounted, watch } from "vue"

    let localValue = ref(null)

    const props = defineProps({
        modelValue: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            default: "tabs",
        },

        tabs: {
            type: Array<{
                label: string
                value: string
                badge?: string | Function
                emphasize?: Boolean | Function
            }>,
            required: true,
        },

        backgroundClass: {
            type: String,
            default: "bg-transparent",
        },

        selectedClass: {
            type: String,
            default: "bg-slate-900",
        },
    })

    const emit = defineEmits(["update:modelValue"])

    onMounted((): void => {
        localValue.value = props.modelValue

        const lastSelectedTab = localStorage.getItem(getLastSelectedKey())

        if (
            lastSelectedTab &&
            props.tabs.find((tab) => tab.value === lastSelectedTab)
        ) {
            localValue.value = lastSelectedTab
            emit("update:modelValue", lastSelectedTab)
        }
    })

    watch(
        () => props.modelValue,
        (value) => {
            localValue.value = value
        }
    )

    const setTab = (value: string): void => {
        localValue.value = value
        emit("update:modelValue", value)

        localStorage.setItem(getLastSelectedKey(), value)
    }

    const calculateSelectedClasses = (tabValue: string): any => {
        return {
            [props.selectedClass]: localValue.value === tabValue,
            'border-transparent': localValue.value !== tabValue,
            'text-slate-200 border-slate-700': localValue.value === tabValue,
        }
    }

    const getLastSelectedKey = () => `lastSelectedTab-${props.name}`
</script>

<template>
    <ul
        :class="backgroundClass + ' bg-red-500 flex space-x-2 text-sm text-slate-450 px-2 border-b border-slate-700 select-none'"
    >
        <li
            v-for="tab in tabs"
            :key="tab.value"
            @click="setTab(tab.value)"
            class="rounded-t px-3 py-1.5 -mb-px cursor-pointer hover:text-slate-300 border-l border-t border-r flex items-center space-x-2"
            :class="calculateSelectedClasses(tab.value)"
        >
            <div>{{ tab.label }}</div>

            <div
                class="flex items-center justify-center h-4 w-5 text-xs border border-slate-700 rounded"
                :class="typeof tab.emphasize === 'function' ?
                    (tab.emphasize() ? 'border-red-500 text-red-500' : 'text-slate-500') :
                    tab.emphasize ? 'border-red-500 text-red-500' : 'text-slate-500'"
                v-if="typeof tab.badge !== 'undefined'"
            >
                {{ typeof tab.badge === "function" ? tab.badge() : tab.badge }}
            </div>
        </li>
    </ul>
</template>
