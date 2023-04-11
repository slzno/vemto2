<script setup lang="ts">
    import UiButton from '@Renderer/components/ui/UiButton.vue';
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import ModelSuiteManager from '@Renderer/views/components/ProjectApps/ModelSuiteManager.vue'
    import CrudManager from './components/ProjectApps/CrudManager.vue'
    import { useRouter } from 'vue-router'

    const router = useRouter(),
        projectStore = useProjectStore()

    const openPage = (pageId: string) => {
        router.push({ name: 'project-page', params: { pageId } })
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
                        placeholder="Search applications..."
                    />
                </div>
            </div>

        </div>
        
        <div>
            <ModelSuiteManager />
            <CrudManager />
        </div>

        <div class="mt-4 space-y-2">
            <div v-for="app in projectStore.project.modelSuites" :key="app.id">
                <span class="font-semibold">{{ app.name }}</span>

                <UiButton @click="app.delete()">Delete</UiButton>

                <div class="px-4">
                    <div v-if="app.factoryId">
                        {{ app.factory.getFileName() }}
                    </div>
                </div>
            </div>

            <div v-for="app in projectStore.project.cruds" :key="app.id">
                <span class="font-semibold">{{ app.name }}</span>

                <UiButton @click="app.delete()">Delete</UiButton>

                <div class="px-4">
                    <div v-if="app.controllerId">
                        {{ app.controller.getFileName() }}
                    </div>
                </div>
                <div class="px-4">
                    <div class="cursor-pointer" v-if="app.indexPageId" @click="openPage(app.indexPageId)">
                        {{ app.indexPage.getFileName() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
