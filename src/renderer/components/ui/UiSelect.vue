<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue"

    const props = defineProps({
        modelValue: {
            type: [String, Number, Boolean, null],
            required: true,
        },

        label: {
            type: String,
        },

        inlineLabel: {
            type: Boolean,
            default: false
        }
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
    <div class="flex gap-1 flex-1" :class="{ 'flex-col': !inlineLabel, 'items-center': inlineLabel }">
        <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
        <select
            class="w-full border border-slate-650 focus:border-red-500 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg focus:ring-transparent"
            v-model="localValue"
        >
            <slot></slot>
        </select>
    </div>
</template>
