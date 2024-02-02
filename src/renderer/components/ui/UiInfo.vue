<script setup lang="ts">
    import { ExclamationCircleIcon } from "@heroicons/vue/24/outline";
</script>

<template>
    <div
        class="bg-slate-900 text-sm text-blue-200 font-mono rounded-lg border border-slate-700 p-2 flex items-center space-x-2 w-full"
    >
        <div>
            <ExclamationCircleIcon class="w-8 h-8 text-blue-500 animate-pulse opacity-70" />
        </div>

        <div>
            <slot></slot>
        </div>
    </div>
</template>

<style scoped></style>
