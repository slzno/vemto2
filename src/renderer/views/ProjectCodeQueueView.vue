<script setup lang="ts">
    import Main from '@Renderer/services/wrappers/Main'
    import RenderableFile from '@Common/models/RenderableFile'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const projectStore = useProjectStore()

    const openFile = (file: RenderableFile): void => {
        Main.API.openProjectFile(file.getRelativeFilePath())
    }
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden p-4"
    >
    <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
        <div>
            <!-- Search -->
            <div class="flex items-center">
                <input
                    type="text"
                    class="border-0 bg-slate-100 dark:bg-slate-850 px-4 py-1 rounded-md"
                    placeholder="Search files..."
                />
            </div>
        </div>

    </div>
        <div
            v-for="file in projectStore.project.renderableFiles"
            :key="file.id"
            class="flex flex-col bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 w-full rounded-lg mb-2 p-2 px-x"
        >
            <div class="flex items-center justify-between">
                <div 
                    class="flex mx-2 cursor-pointer" 
                    @click="openFile(file)"
                >
                    <div class="p-1 rounded-md bg-slate-800 mr-2">
                        <div class="flex items-center space-x-1 text-xs">
                            <div class="rounded-full w-3 h-3 bg-green-500"></div>
                            <div>{{ file.status }}</div>
                        </div>
                    </div>
                    <div class="italic hover:text-red-500 dark:hover:text-red-400">{{ file.getRelativeFilePath() }}</div>
                </div>
                <div class="flex items-center">
                    <button class="p-1 px-2 rounded bg-slate-900 mr-2" @click="file.regenerate()">
                        Regenerate
                    </button>
                    <button class="p-1 px-2 rounded bg-slate-900" @click="file.delete()">
                        Delete
                    </button>
                </div>
            </div>

            <div class="text-red-500" v-if="file.error">
                {{ file.error }}
            </div>
        </div>
    </div>
</template>
