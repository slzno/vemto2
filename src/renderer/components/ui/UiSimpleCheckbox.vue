<script setup lang="ts">
    import { defineProps } from "vue"

    const props = defineProps({
        label: {
            type: String,
        },

        smallText: {
            type: Boolean,
            default: false,
        },

        checked: {
            type: Boolean,
            default: false,
            required: true
        },
    })
</script>

<template>
    <label class="inline-box">
        <div class="flex items-center space-x-1 group">
            <input
                type="checkbox"
                :checked="checked"
                class="rounded bg-slate-950 border-0 text-red-450 shadow-sm focus:border-red-450 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                @input="$emit('change', $event)"
            />
            <span :class="{
                'text-xs': smallText,
                'text-sm': !smallText,
            }" class="text-slate-400 group-hover:text-slate-300" v-if="label">{{ label }}</span>
        </div>
    </label>
</template>
