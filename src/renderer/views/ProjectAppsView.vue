<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import CrudManager from "./components/ProjectApps/CrudManager.vue"
    import { useRouter } from "vue-router"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref } from "vue"

    const router = useRouter(),
        projectStore = useProjectStore()

    const openCrud = (crudId: string) => {
        router.push({ name: "project-crud", params: { crudId } })
    }

    const selectedTab = ref("applications")

    const tabs = [
        { label: "Applications", value: "applications" },
        { label: "Routes", value: "routes" },
        { label: "Menu", value: "menu" },
        { label: "Domains", value: "domains" },
        { label: "Default Files", value: "default_files" },
        { label: "Themes", value: "themes" },
    ]
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div class="mt-2">
            <UiTabs :tabs="tabs" v-model="selectedTab" :external="true" />
        </div>
        
        <div class="p-4" v-if="selectedTab === 'applications'">
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
                <CrudManager />
            </div>
    
            <div class="mt-4 space-y-2 flex">
                <div class="border border-slate-700 rounded-lg p-2 cursor-pointer hover:bg-slate-950" v-for="app in projectStore.project.cruds" :key="app.id" @click="openCrud(app.id)">
                    <span class="font-semibold">{{ app.name }}</span>
    
                    <UiButton @click="app.delete()">Delete</UiButton>
                </div>
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'routes'">
            <div class="space-y-2">
                <div class="bg-slate-950 rounded-lg p-3 flex justify-between">
                    <div>
                        <div class="mt-2 space-x-1 font-mono">
                            <span class="px-2 py-0.5 bg-orange-200 text-orange-700 rounded">Middleware</span> <span>'auth:sanctum', 'verified'</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-950 rounded-lg p-3 flex justify-between ml-10" v-for="route in projectStore.project.routes" :key="route.id">
                    <div>
                        <div class="mt-2 space-x-1 font-mono">
                            <span class="px-2 py-0.5 bg-green-300 text-green-700 rounded">{{ route.method.toUpperCase() }}</span> <span>{{ route.path }}</span>
                        </div>
                    </div>

                    <div>
                        <div class="rounded px-2 py-1 bg-slate-800 inline-block text-sm">
                            {{ route.name }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
