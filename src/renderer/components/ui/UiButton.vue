<script setup lang="ts">
    import { defineProps } from "vue"

    const props = defineProps({
        disabled: {
            type: Boolean,
            default: false
        }
    })
</script>
<template>
    <button :disabled="disabled" class="border border-slate-350 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 px-2.5 py-1 rounded-md flex items-center justify-between select-none outline-none focus:border-red-500 dark:focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-200 disabled:hover:text-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-300">
        <slot />
    </button>
</template>
