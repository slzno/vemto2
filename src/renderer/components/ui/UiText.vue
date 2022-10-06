<script setup lang="ts">
    import { defineProps, defineEmits, ref, onMounted } from "vue"

    let localValue = ref("")

    const props = defineProps({
        modelValue: {
            type: String,
            required: true,
        },
    })
    
    defineEmits(["update:modelValue"])

    onMounted((): void => {
        localValue.value = props.modelValue
    })
</script>

<template>
    <input
        class="w-full py-2 px-4 rounded border border-slate-300"
        type="text"
        v-model="localValue"
        @input="$emit('update:modelValue', localValue)"
    />
</template>
