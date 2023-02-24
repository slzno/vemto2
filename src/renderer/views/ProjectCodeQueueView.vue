<script setup lang="ts">
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const projectStore = useProjectStore()
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden p-4"
    >
        <div
            v-for="file in projectStore.project.renderableFiles"
            :key="file.id"
            class="flex flex-col bg-slate-200 dark:bg-slate-950 w-full rounded-lg mb-2 p-2"
        >
            <div class="flex">
                <div class="mr-2">{{ file.name }} - {{ file.status }}</div>
                <button @click="file.regenerate()">
                    Regenerate
                </button>
            </div>

            <div class="text-red-500" v-if="file.error">
                {{ file.error }}
            </div>
        </div>
    </div>
</template>
