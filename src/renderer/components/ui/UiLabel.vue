<script setup lang="ts">
    import { useSlots } from "vue"
    import UiHint from "@Renderer/components/ui/UiHint.vue"

    const slots = useSlots()

    const props = defineProps({
        hintType: {
            type: String,
            default: "info",
        },
    })
</script>

<template>
    <label class="text-xs text-slate-500 dark:text-slate-400 flex items-center">
        <div>
            <slot></slot>
        </div>

        <div v-if="slots.hint">
            <UiHint :type="hintType">
                <slot name="hint"></slot>
            </UiHint>
        </div>
    </label>
</template>

<style scoped></style>
