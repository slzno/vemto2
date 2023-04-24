<script setup lang="ts">
    import { defineProps, defineEmits, computed } from "vue"

    const props = defineProps({
        modelValue: {
            type: String,
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
        }
    })

    const emit = defineEmits(["update:modelValue", "change", "blur"]),
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
    <input
        class="w-full focus:border focus:border-red-500 dark:text-slate-200 focus:ring-transparent border-transparent bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
        type="text"
        :id="id"
        :placeholder="placeholder"
        v-model="localValue"
        @blur="$emit('blur', localValue)"
        spellcheck="false"
        autocomplete="false"
        :disabled="disabled"
    />
</template>
