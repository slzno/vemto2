<script setup lang="ts">
    import UiButton from '@Renderer/components/ui/UiButton.vue';
import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import ModelSuiteManager from '@Renderer/views/components/ProjectApps/ModelSuiteManager.vue'
    import CrudManager from './components/ProjectApps/CrudManager.vue'

    const projectStore = useProjectStore()
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
                        placeholder="Search applications..."
                    />
                </div>
            </div>

        </div>
        
        <div>
            <ModelSuiteManager />
            <CrudManager />
        </div>

        <div class="mt-4">
            <div v-for="app in projectStore.project.modelSuites" :key="app.id">
                {{ app.name }}

                <UiButton @click="app.delete()">Delete</UiButton>

                <div class="px-4">
                    <div v-if="app.factoryId">
                        {{ app.factory.getFileName() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
