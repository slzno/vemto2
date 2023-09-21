<script setup lang="ts">
    import { BookmarkSlashIcon, CubeTransparentIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
</script>

<template>
    <div
        style="width: calc(100vw - 80px)"
        class="text-sm p-2 fixed top-0 right-0 h-screen flex items-center justify-center space-x-2 pointer-events-none"
    >
        <div class="flex flex-col items-center space-y-10">
            <div>
                <CubeTransparentIcon class="w-36 h-36 text-slate-800 stroke-1" />
            </div>
    
            <div class="text-slate-500 text-4xl font-thin">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
