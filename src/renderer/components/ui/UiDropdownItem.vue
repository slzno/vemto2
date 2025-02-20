<template>
    <li 
        :class="[
            'flex items-center justify-start text-md p-1 px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300',
            disabled ? 'opacity-25 cursor-not-allowed' : 'opacity-100 cursor-pointer'
        ]"
        :aria-disabled="disabled"
    >
        <slot></slot>
    </li>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },

    setup(props) {
        const disabled = computed(() => props.disabled)

        return {
            disabled
        }
    }
})
</script>
