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
    ]
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <UiTabs :tabs="tabs" v-model="selectedTab" />
        
        <div class="p-4">
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

    </div>
</template>
