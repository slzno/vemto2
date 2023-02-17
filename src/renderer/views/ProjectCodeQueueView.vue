<script setup lang="ts">
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const projectStore = useProjectStore()
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div
            v-for="file in projectStore.project.renderableFiles"
            :key="file.id"
        >
            <div>{{ file.name }}</div>
        </div>
    </div>
</template>
