<script setup lang="ts">
    import { defineProps, defineEmits, computed } from "vue"

    const props = defineProps({
        modelValue: {
            type: Boolean,
            default: false,
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
    <label class="flex items-center space-x-1">
        <input
            type="checkbox"
            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
            v-model="localValue"
        />
        <span class="text-xs text-slate-400" v-if="label">{{ label }}</span>
    </label>
</template>
