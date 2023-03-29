<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue"

    const props = defineProps({
        modelValue: {
            type: [String, Number, Boolean],
            required: true,
        },

        label: {
            type: String,
        },
    })

    const emit = defineEmits(["update:modelValue", "change"]),
        localValue = computed({
            get(): any {
                return props.modelValue
            },
            
            set(value: any): void {
                emit('update:modelValue', value)
                emit('change', value)
            },
        })
</script>

<template>
    <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
    <select
        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
        v-model="localValue"
    >
        <slot></slot>
    </select>
</template>
