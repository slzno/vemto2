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
        },
        
        inlineLabel: {
            type: Boolean,
            default: false
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
    <div class="flex gap-1 flex-1" :class="{ 'flex-col': !inlineLabel, 'items-center': inlineLabel }">
        <label v-if="label" class="text-xs text-slate-500 dark:text-slate-400">{{ label }}</label>
        <input
            :class="{ 'flex-1': inlineLabel }"
            class="border border-slate-300 dark:border-slate-650 focus:border-red-500 dark:focus:border-red-500 dark:focus:text-slate-200 dark:text-slate-300 focus:ring-transparent bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-slate-500 placeholder:font-thin"
            type="date"
            :id="id"
            :placeholder="placeholder"
            v-model="localValue"
            @blur="$emit('blur', localValue)"
            @focus="$emit('focus', localValue)"
            spellcheck="false"
            autocomplete="false"
            :disabled="disabled"
        />
    </div>
</template>
