<script setup lang="ts">
    import { defineProps, defineEmits, ref, onMounted } from "vue"

    let localValue = ref(null)

    const props = defineProps({
        modelValue: {
            type: [String, Number, Boolean],
            required: true,
        },

        label: {
            type: String,
        },
    })

    const emit = defineEmits(["update:modelValue", "change"])

    onMounted((): void => {
        localValue.value = props.modelValue
    })

    const valueChanged = (): void => {
        emit("change", localValue.value)
        emit("update:modelValue", localValue.value)
    }
</script>

<template>
    <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
    <select
        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
        v-model="localValue"
        @change="valueChanged()"
    >
        <slot></slot>
    </select>
</template>
