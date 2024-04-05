<script setup lang="ts">
    import { ExclamationCircleIcon } from "@heroicons/vue/24/outline";
</script>

<template>
    <div
        class="bg-slate-900 text-sm text-yellow-50 font-mono rounded-lg border border-slate-700 p-2 flex items-center space-x-2 w-full"
    >
        <div class="text-2xl">
            💡
        </div>

        <div>
            <b>TIP:</b><slot></slot>
        </div>
    </div>
</template>

<style scoped></style>
