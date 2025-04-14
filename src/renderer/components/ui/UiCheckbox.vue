<script setup lang="ts">
    import { defineProps, defineEmits, computed } from "vue"
import UiHint from "./UiHint.vue";

    const props = defineProps({
        modelValue: {
            type: Boolean,
            default: false,
            required: true,
        },

        label: {
            type: String,
        },

        smallText: {
            type: Boolean,
            default: false,
        },

        hint: {
            type: String,
        },

        hintType: {
            type: String,
            default: "info",
        },

        disabled: {
            type: Boolean,
            default: false,
        }
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
    <div class="inline-block">
        <label>
            <div class="inline-block">
                <div class="flex items-center space-x-1 group">
                    <input
                        type="checkbox"
                        class="rounded bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-red-450 shadow-sm focus:border-red-500 dark:focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                        v-model="localValue"
                        :disabled="disabled"
                    />
                    <span :class="{
                        'text-xs': smallText,
                        'text-sm': !smallText,
                    }" class="hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300 select-none" v-if="label">{{ label }}</span>

                    <div v-if="hint">
                        <UiHint :type="hintType">
                            <span v-html="hint"></span>
                        </UiHint>
                    </div>
                </div>
            </div>
        </label>
    </div>
</template>
