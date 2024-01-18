<script setup lang="ts">
    import { ref, defineProps, defineEmits, computed, nextTick } from "vue"
    import { LockClosedIcon, LockOpenIcon } from "@heroicons/vue/24/outline"

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

    const emit = defineEmits(["update:modelValue", "input", "blur", "focus"]),
        localValue = computed({
            get(): any {
                return props.modelValue
            },
            
            set(value: any): void {
                emit('update:modelValue', value)
                emit('input', value)
            },
        })

    const isDisabled = computed(() => {
        if(locked.value) return true

        return props.disabled
    })

    const locked = ref(true),
        textInput = ref(null)

    const toggleLock = () => {
        locked.value = !locked.value

        if(!locked.value) {
            nextTick(() => {
                textInput.value.focus()
            })
        }
    }
</script>

<template>
    <div class="flex gap-1 flex-1" :class="{ 'flex-col': !inlineLabel, 'items-center': inlineLabel }">
        <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
        <div :class="{ 'flex-1': inlineLabel }" class="flex">
            <input
                ref="textInput"
                class="flex-1 border border-slate-650 border-r-transparent focus:border-red-500 focus:border-r-red-500 dark:focus:text-slate-200 dark:text-slate-300 focus:ring-transparent bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg rounded-r-none disabled:opacity-60 disabled:cursor-not-allowed"
                type="text"
                :id="id"
                :placeholder="placeholder"
                v-model="localValue"
                @blur="$emit('blur', localValue)"
                @focus="$emit('focus', localValue)"
                spellcheck="false"
                autocomplete="false"
                :disabled="isDisabled"
            />
            <button 
                @click="toggleLock"
                class="flex px-2 items-center bg-slate-100 dark:bg-slate-950 border border-slate-650 border-l-0 rounded-lg rounded-l-none cursor-pointer hover:text-red-500"
            >
                <LockClosedIcon v-if="locked" class="w-4 h-4 stroke-2" />
                <LockOpenIcon v-else class="w-4 h-4 stroke-2" />
            </button>
        </div>
    </div>
</template>
