<script setup lang="ts">
    import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
</script>

<template>
    <div
        class="bg-slate-900 text-sm text-yellow-200 font-mono rounded-lg border border-slate-700 p-2 flex items-center space-x-2 w-full"
    >
        <div>
            <ExclamationTriangleIcon class="w-8 h-8 text-yellow-500 animate-pulse opacity-70" />
        </div>

        <div>
            <slot></slot>
        </div>
    </div>
</template>

<style scoped></style>
