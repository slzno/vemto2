<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import CrudManager from "./components/ProjectApps/CrudManager.vue"
    import { useRouter } from "vue-router"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { onMounted, ref } from "vue"
    import PageManager from "./components/ProjectApps/PageManager.vue"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"
    import Crud from "@Common/models/crud/Crud"
    import Page from "@Common/models/page/Page"
import AppRoutes from "./components/ProjectApps/AppRoutes.vue"
import AppNavs from "./components/ProjectApps/AppNavs.vue"

    const router = useRouter(),
        projectStore = useProjectStore(),
        canShow = ref(false)

    const openApp = (app: Crud | Page) => {
        console.log(app)
        if(app.getAppType() === "CRUD") {
            router.push({ name: "project-crud", params: { crudId: app.id } })
        } else {
            router.push({ name: "project-page", params: { pageId: app.id } })
        }
    }

    const selectedTab = ref("applications")

    const tabs = [
        { label: "Applications", value: "applications" },
        { label: "Routes", value: "routes" },
        { label: "Navigation", value: "navigation" },
        { label: "Domains", value: "domains" },
        { label: "Themes", value: "themes" },
        { label: "Plugins", value: "plugins" },
        { label: "Settings", value: "settings" },
    ]

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => canShow.value = true)
    })
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
        v-if="canShow"
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

            <div class="flex space-x-2">
                <CrudManager />
                <PageManager />
            </div>

            <div class="mt-4 space-y-2 flex flex-col">
                <div
                    class="border border-slate-700 bg-slate-850 rounded-lg p-3 cursor-pointer hover:bg-slate-800 w-full flex justify-between items-start"
                    v-for="app in projectStore.project.getApplications()"
                    :key="app.id"
                    @click="openApp(app)"
                >
                    <div class="flex flex-col">
                        <span class="font-semibold">{{ app.getLabel() }}</span>
                        <div class="text-slate-400">{{ app.getAppType() }}</div>
                    </div>

                    <UiButton class="text-sm" @click="app.delete()"
                        >Delete</UiButton
                    >
                </div>
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'routes'">
            <div class="space-y-2">
                <AppRoutes />
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'navigation'">
            <div class="space-y-2">
                <AppNavs />
            </div>
        </div>
    </div>
</template>
