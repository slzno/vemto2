<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import CrudManager from "./components/ProjectApps/CrudManager.vue"
    import CrudApiManager from "./components/ProjectApps/CrudApiManager.vue"
    import FilamentResourceManager from "./components/ProjectApps/FilamentResourceManager.vue"
    import NovaResourceManager from "./components/ProjectApps/NovaResourceManager.vue"
    import { useRouter } from "vue-router"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, Ref, computed, onMounted } from "vue"
    import PageManager from "./components/ProjectApps/PageManager.vue"
    import Crud, { CrudType } from "@Common/models/crud/Crud"
    import Page from "@Common/models/page/Page"
    import AppRoutes from "./components/ProjectApps/AppRoutes.vue"
    import AppNavs from "./components/ProjectApps/AppNavs.vue"
    import AppSections from "./components/ProjectApps/AppSections.vue"
    import AppThemes from "./components/ProjectApps/AppThemes.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
    import { PlusIcon } from "@heroicons/vue/24/outline"
    import AppTemplates from "./components/ProjectApps/AppTemplates.vue"

    const router = useRouter(),
        projectStore = useProjectStore(),
        apps = ref([]) as Ref<(Crud | Page)[]>,
        search = ref("")

    onMounted(() => {
        loadApps()
    })

    const loadApps = () => {
        setTimeout(() => {
            apps.value = projectStore.project.getNonDetailApplications()
        }, 100)
    }

    const filteredApplications = computed(() => {
        return apps.value.filter((app) => {
            return app.getLabel().toLowerCase().includes(search.value.toLowerCase())
        })
    })

    const openApp = (app: Crud | Page) => {
        if (["Page"].includes(app.getAppType())) {
            router.push({ name: "project-page", params: { pageId: app.id } })
        } else {
            router.push({ name: "project-crud", params: { crudId: app.id } })
        }
    }

    const deleteApp = async (app: Crud | Page) => {
        const confirmed = await window.projectConfirm(`Are you sure you want to delete ${app.getLabel()}?`)
        if (!confirmed) return

        apps.value = apps.value.filter((a) => a.id !== app.id)

        app.delete()

        loadApps()
    }

    const selectedTab = ref("applications")

    const tabs = [
        { label: "Applications", value: "applications" },
        { label: "Sections", value: "sections" },
        { label: "Routes", value: "routes" },
        { label: "Navigation", value: "navigation" },
        { label: "Templates", value: "templates" },
        { label: "Themes", value: "themes" },
        // { label: "Settings", value: "settings" },
    ]
</script>

<template>
    <div
        v-if="projectStore.projectIsReady"
        class="dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <div class="mt-3">
            <UiTabs :name="projectStore.project.getTabNameFor('apps')" :tabs="tabs" v-model="selectedTab" />
        </div>

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
                <CrudManager @created="loadApps()" />
                <PageManager @created="loadApps()" />
                <CrudApiManager @created="loadApps()" />
                <FilamentResourceManager @created="loadApps()" />
                <NovaResourceManager @created="loadApps()" />
                <UiButton disabled>
                    <PlusIcon class="w-4 h-4 mr-1" />
                    Report
                </UiButton>
                <!-- <UiButton disabled>
                    <PlusIcon class="w-4 h-4 mr-1" />
                    Dashboard
                </UiButton> -->
                <!-- <UiButton @click="projectStore.project.deleteAllApplications()">Delete All</UiButton> -->
            </div>

            <div class="mt-4 space-y-2 flex flex-col overflow-y-auto pb-14" style="height: calc(100vh - 180px)">
                <UiEmptyMessage v-if="!filteredApplications.length">
                    <span>There are no applications yet</span>
                </UiEmptyMessage>
                
                <div
                    class="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 rounded-lg p-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 w-full flex justify-between items-start"
                    v-for="app in filteredApplications"
                    :key="app.id"
                    @click="openApp(app)"
                >
                    <div class="flex flex-col">
                        <div class="text-lg flex items-center space-x-2">
                            <div>{{ app.getLabel() }}</div>
                            <div v-if="app.isInvalid()">
                                <span class="flex items-center justify-center border border-red-450 px-2 rounded text-red-450 text-sm">Has issues to fix</span>
                            </div>
                        </div>
                        <div class="text-slate-450 text-xs">{{ app.getAppSubType() }}</div>
                    </div>

                    <UiButton class="text-sm" @click.stop="deleteApp(app)"
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
            <!-- <AppTemplates /> -->
            <UiEmptyMessage>
                <span>Under development... COMING SOON!</span>
            </UiEmptyMessage>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'settings'">
            <UiEmptyMessage>
                <span>Also under development... COMING SOON!</span>
            </UiEmptyMessage>
        </div>
    </div>
</template>
