<script setup lang="ts">
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import RenderableFile from "@Common/models/RenderableFile"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { computed, ref, onMounted } from "vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
    import RenderableFileViewer from "./components/CodeQueue/RenderableFileViewer.vue"

    const projectStore = useProjectStore(),
        search = ref(""),
        searchRemoved = ref("")

    const selectedTab = ref("queue")

    const tabs = [
        {
            label: "Queue",
            value: "queue",
            badge: () =>
                projectStore.project.getNonRemovedRenderableFiles(false).length,
        },
        {
            label: "Conflicts",
            value: "conflicts",
            badge: () =>
                projectStore.project.getConflictRenderableFiles(false).length,
        },
        {
            label: "Ignored",
            value: "ignored",
            badge: () => projectStore.project.getIgnoredRenderableFiles(false).length,
        },
        {
            label: "Removed",
            value: "removed",
            badge: () =>
                projectStore.project.getRemovedRenderableFiles(false).length,
        },
        { label: "Settings", value: "settings" },
    ]

    onMounted(() => {
        projectStore.project.startCodeGenerationSettings()
    })

    const filteredFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                projectStore.project.getNonRemovedRenderableFiles(),
                search
            )
        }),
        removedFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                projectStore.project.getRemovedRenderableFiles(),
                searchRemoved
            )
        }),
        conflictFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                projectStore.project.getConflictRenderableFiles(),
                search
            )
        }),
        ignoredFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                projectStore.project.getIgnoredRenderableFiles(),
                search
            )
        })

    const filterBySearch = (
        files: RenderableFile[],
        search: any
    ): RenderableFile[] => {
        return files.filter((file) => {
            return file
                .getRelativeFilePath()
                .toLowerCase()
                .includes(search.value.toLowerCase())
        })
    }

    const clearRemovedFiles = async () => {
        const confirmed = await window.projectConfirm("Are you sure you want to clear all removed files?")

        if(!confirmed) return

        projectStore.project?.clearRemovedFiles()
    }
</script>

<template>
    <div
        v-if="projectStore.projectIsReady"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll"
    >
        <div class="mt-3">
            <UiTabs 
                :name="projectStore.project.getTabNameFor('queue')" 
                :tabs="tabs" 
                v-model="selectedTab" 
            />
        </div>

        <div class="p-4" v-if="selectedTab === 'queue'">
            <UiEmptyMessage v-if="!filteredFiles.length">
                <span>There are no files in the Queue</span>
            </UiEmptyMessage>

            <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
                <div>
                    <!-- Search -->
                    <div class="flex items-center">
                        <UiText
                            v-model="search"
                            placeholder="Search files..."
                        />
                    </div>
                </div>
            </div>

            <RenderableFileViewer
                v-for="file in filteredFiles"
                :key="file.id"
                :file="file"
            >
            </RenderableFileViewer>
        </div>

        <div class="p-4" v-if="selectedTab === 'conflicts'">
            <UiEmptyMessage v-if="!conflictFiles.length">
                <span>There are no files with conflicts</span>
            </UiEmptyMessage>

            <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
                <div>
                    <!-- Search -->
                    <div class="flex items-center">
                        <UiText
                            v-model="search"
                            placeholder="Search files..."
                        />
                    </div>
                </div>
            </div>

            <RenderableFileViewer
                v-for="file in conflictFiles"
                :key="file.id"
                :file="file"
            >
            </RenderableFileViewer>
        </div>

        <div class="p-4" v-if="selectedTab === 'ignored'">
            <UiEmptyMessage v-if="!ignoredFiles.length">
                <span>There are no ignored files</span>
            </UiEmptyMessage>

            <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
                <div>
                    <!-- Search -->
                    <div class="flex items-center">
                        <UiText
                            v-model="search"
                            placeholder="Search files..."
                        />
                    </div>
                </div>
            </div>

            <RenderableFileViewer
                v-for="file in ignoredFiles"
                :key="file.id"
                :file="file"
            >
            </RenderableFileViewer>
        </div>

        <div class="p-4" v-if="selectedTab === 'removed'">
            <UiEmptyMessage v-if="!removedFiles.length">
                <span>There are no removed files</span>
            </UiEmptyMessage>

            <div class="flex top-0 left-0 space-x-2 text-sm z-20 mb-4">
                <div>
                    <!-- Search -->
                    <div class="flex items-center">
                        <UiText
                            v-model="search"
                            placeholder="Search files..."
                        />
                    </div>
                </div>

                <UiButton @click="clearRemovedFiles()">Clear All</UiButton>
            </div>

            <RenderableFileViewer
                v-for="file in removedFiles"
                :key="file.id"
                :file="file"
            >
            </RenderableFileViewer>
        </div>

        <div class="p-4" v-if="selectedTab === 'settings'">
            <UiCheckbox
                v-model="projectStore.project.codeGenerationSettings.models"
                label="Generate Models"
                @change="projectStore.project.save()"
            />

            <UiCheckbox
                v-model="projectStore.project.codeGenerationSettings.factories"
                label="Generate Factories"
                @change="projectStore.project.save()"
            />

            <UiCheckbox
                v-model="projectStore.project.codeGenerationSettings.seeders"
                label="Generate Seeders"
                @change="projectStore.project.save()"
            />

            <UiCheckbox
                v-model="projectStore.project.codeGenerationSettings.policies"
                label="Generate Policies"
                @change="projectStore.project.save()"
            />

            <UiCheckbox
                v-model="projectStore.project.codeGenerationSettings.routes"
                label="Generate Routes"
                @change="projectStore.project.save()"
            />
        </div>
    </div>
</template>
