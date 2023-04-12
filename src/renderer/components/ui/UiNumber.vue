<script setup lang="ts">
    import { defineProps, defineEmits, computed } from "vue"

    const props = defineProps({
        modelValue: {
            type: Number,
            required: true,
        },

        label: {
            type: String,
        },

        placeholder: {
            type: String,
        },

        disabled: {
            type: Boolean,
            default: false,
        },

        id: {
            type: String,
            default: "",
        },

        max: {
            type: Number,
            default: 0,
        },

        min: {
            type: Number,
            default: 0,
        },

        step: {
            type: Number,
            default: 1
        }
    })

    const emit = defineEmits(["update:modelValue", "input", "blur"]),
        localValue = computed({
            get(): any {
                return props.modelValue
            },
            
            set(value: any): void {
                emit('update:modelValue', value)
                emit('input', value)
            },
        })
</script>

<template>
    <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
    <input
        class="w-full dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        type="number"
        :max="max > 0 ? max : null"
        :min="min"
        :id="id"
        :step="step"
        :placeholder="placeholder"
        v-model="localValue"
        @blur="$emit('blur', localValue)"
        spellcheck="false"
        autocomplete="false"
        :disabled="disabled"
    />
</template>
