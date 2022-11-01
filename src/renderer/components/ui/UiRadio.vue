<script setup lang="ts">
    import { defineProps, defineEmits, ref, onMounted } from "vue"

    let localValue = ref(null)

    const props = defineProps({
        modelValue: {
            type: [Boolean, String, Number],
            default: false,
            required: true,
        },

        label: {
            type: String,
        },

        value: {
            type: [Boolean, String, Number],
            default: true,
        },
    })

    defineEmits(["update:modelValue"])

    onMounted((): void => {
        localValue.value = props.modelValue
    })
</script>

<template>
    <label class="flex items-center space-x-1">
        <input
            :value="value"
            type="radio"
            class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
            v-model="localValue"
            @change="$emit('update:modelValue', localValue)"
        />
        <span class="text-xs text-slate-400" v-if="label">{{ label }}</span>
    </label>
</template>
