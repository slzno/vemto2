<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import CrudManager from "./components/ProjectApps/CrudManager.vue"
    import { useRouter } from "vue-router"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, computed } from "vue"
    import PageManager from "./components/ProjectApps/PageManager.vue"
    import Crud from "@Common/models/crud/Crud"
    import Page from "@Common/models/page/Page"
    import AppRoutes from "./components/ProjectApps/AppRoutes.vue"
    import AppNavs from "./components/ProjectApps/AppNavs.vue"
    import AppSections from "./components/ProjectApps/AppSections.vue"
    import AppThemes from "./components/ProjectApps/AppThemes.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
import { PlusIcon } from "@heroicons/vue/24/outline"

    const router = useRouter(),
        projectStore = useProjectStore(),
        search = ref("")

    const filteredApplications = computed(() => {
        return projectStore.project.getApplications().filter((app) => {
            return app.getLabel().toLowerCase().includes(search.value.toLowerCase())
        })
    })

    const openApp = (app: Crud | Page) => {
        if (app.getAppType() === "CRUD") {
            router.push({ name: "project-crud", params: { crudId: app.id } })
        } else {
            router.push({ name: "project-page", params: { pageId: app.id } })
        }
    }

    const selectedTab = ref("applications")

    const tabs = [
        { label: "Applications", value: "applications" },
        { label: "Sections", value: "sections" },
        { label: "Routes", value: "routes" },
        { label: "Navigation", value: "navigation" },
        { label: "Themes", value: "themes" },
        { label: "Templates", value: "templates" },
        // { label: "Settings", value: "settings" },
    ]
</script>

<template>
    <div
        v-if="projectStore.projectIsReady"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div class="mt-2">
            <UiTabs :name="projectStore.project.getTabNameFor('apps')" :tabs="tabs" v-model="selectedTab" />
        </div>

        <!-- {{ projectStore.project.settings  }}
        {{ projectStore.project.connectionFinished  }} -->

        <div class="p-4 h-full" v-if="selectedTab === 'applications'">
            <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
                <div>
                    <!-- Search -->
                    <div class="flex items-center">
                        <UiText
                            v-model="search"
                            placeholder="Search applications..."
                        />
                    </div>
                </div>
            </div>

            <div class="flex space-x-2">
                <CrudManager />
                <PageManager />
                <UiButton disabled>
                    <PlusIcon class="w-4 h-4 mr-1" />
                    API Resource
                </UiButton>
                <UiButton disabled>
                    <PlusIcon class="w-4 h-4 mr-1" />
                    Filament Resource
                </UiButton>
                <UiButton disabled>
                    <PlusIcon class="w-4 h-4 mr-1" />
                    Nova Resource
                </UiButton>
                <!-- <UiButton @click="projectStore.project.deleteAllApplications()">Delete All</UiButton> -->
            </div>

            <div class="mt-4 space-y-2 flex flex-col h-full">
                <UiEmptyMessage v-if="!filteredApplications.length">
                    <span>There are no applications yet</span>
                </UiEmptyMessage>
                <div
                    class="border border-slate-700 bg-slate-850 rounded-lg p-3 cursor-pointer hover:bg-slate-800 w-full flex justify-between items-start"
                    v-for="app in filteredApplications"
                    :key="app.id"
                    @click="openApp(app)"
                >
                    <div class="flex flex-col">
                        <span class="font-semibold">{{ app.getLabel() }}</span>
                        <div class="text-slate-400">{{ app.getAppSubType() }}</div>
                    </div>

                    <UiButton class="text-sm" @click.stop="app.delete()"
                        >Delete</UiButton
                    >
                </div>
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'sections'">
            <div class="space-y-2">
                <AppSections />
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

        <div class="space-y-2 p-4" v-if="selectedTab === 'themes'">
            <div class="space-y-2">
                <AppThemes />
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'templates'">
            <UiEmptyMessage development>
                <span>Under development... COMING SOON!</span>
            </UiEmptyMessage>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'settings'">
            <UiEmptyMessage development>
                <span>Also under development... COMING SOON!</span>
            </UiEmptyMessage>
        </div>
    </div>
</template>
