<script setup lang="ts">
    import { defineProps, defineEmits, ref, onMounted } from "vue"

    let localValue = ref("")

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
    })

    defineEmits(["update:modelValue"])

    onMounted((): void => {
        localValue.value = props.modelValue
    })
</script>

<template>
    <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
    <input
        class="w-full dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
        type="text"
        :placeholder="placeholder"
        v-model="localValue"
        @input="$emit('update:modelValue', localValue)"
        spellcheck="false"
        autocomplete="false"
    />
</template>
