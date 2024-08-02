<script setup lang="ts">
    import { debounce } from "lodash"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import RenderableFile from "@Common/models/RenderableFile"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { computed, ref, onMounted, Ref, nextTick, onBeforeUnmount } from "vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
    import RenderableFileViewer from "./components/CodeQueue/RenderableFileViewer.vue"
    import { CubeTransparentIcon } from "@heroicons/vue/24/outline"
    import ConflictsSolver from "./components/CodeQueue/ConflictsSolver.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import InternalFiles from "@Renderer/util/InternalFiles"
    import Alert from "@Renderer/components/utils/Alert"

    const projectStore = useProjectStore(),
        search = ref(""),
        searchRemoved = ref(""),
        allFiles = ref([]) as Ref<RenderableFile[]>,
        allRemovedFiles = ref([]) as Ref<RenderableFile[]>,
        allConflictFiles = ref([]) as Ref<RenderableFile[]>,
        allIgnoredFiles = ref([]) as Ref<RenderableFile[]>,
        allSkippedFiles = ref([]) as Ref<RenderableFile[]>,
        loadingFiles = ref(false),
        uiTabs = ref(null),
        conflictsSolver = ref(null),
        currentConflictsFile = ref(null) as Ref<RenderableFile>,
        conflictsFilePath = ref(""),
        conflictsFileContent = ref(""),
        conflictsNewFileContent = ref("")

    let filesListenerId = null

    onMounted(() => {
        projectStore.project.startCodeGenerationSettings()

        filesListenerId = projectStore.project.addListener('renderableFiles:changed', debounce(async () => {
            loadFiles()
        }, 100))

        loadFiles()
    })

    onBeforeUnmount(() => {
        if(projectStore.projectIsEmpty) return

        projectStore.project.removeListener(filesListenerId)
    })

    const loadFiles = async () => {
        if(projectStore.projectIsEmpty) return

        console.log("Loading files...")

        loadingFiles.value = true
        uiTabs.value.setLoadingTab(selectedTab.value)

        await nextTick()

        setTimeout(async () => {
            if(projectStore.projectIsEmpty) return

            allFiles.value = projectStore.project.getAllRenderableFiles()
            allRemovedFiles.value = allFiles.value.filter(file => file.wasRemoved())
            allConflictFiles.value = allFiles.value.filter(file => file.hasConflict())
            allIgnoredFiles.value = allFiles.value.filter(file => file.wasIgnored())
            allSkippedFiles.value = allFiles.value.filter(file => file.wasSkipped())
            
            setTimeout(() => {
                loadingFiles.value = false
                uiTabs.value.clearLoadingTab()
            }, 100)
        }, 0)
    }

    const selectedTab = ref("queue")

    const tabs = [
        {
            label: "Queue",
            value: "queue",
            badge: () => allFiles.value.length,
        },
        {
            label: "Conflicts",
            value: "conflicts",
            badge: () => allConflictFiles.value.length,
        },
        {
            label: "Skipped",
            value: "skipped",
            badge: () => allSkippedFiles.value.length,
        },
        {
            label: "Ignored",
            value: "ignored",
            badge: () => allIgnoredFiles.value.length,
        },
        {
            label: "Removed",
            value: "removed",
            badge: () => allRemovedFiles.value.length,
        },
        { label: "Settings", value: "settings" },
    ]

    const filteredFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                allFiles.value,
                search
            )
        }),
        removedFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                allRemovedFiles.value,
                searchRemoved
            )
        }),
        conflictFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                allConflictFiles.value,
                search
            )
        }),
        ignoredFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                allIgnoredFiles.value,
                search
            )
        }),
        skippedFiles = computed(() => {
            if (!projectStore.project || !projectStore.project.renderableFiles)
                return []

            return filterBySearch(
                allSkippedFiles.value,
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

    const showConflictsSolver = async (file: RenderableFile): Promise<void> => {
        currentConflictsFile.value = file
        conflictsFilePath.value = file.getRelativeFilePath()
        conflictsFileContent.value = await Main.API.readProjectFile(conflictsFilePath.value)
        conflictsNewFileContent.value = await InternalFiles.readGeneratedFile(conflictsFilePath.value)

        nextTick(() => {
            conflictsSolver.value.show()
        })
    }

    const conflictsSolved = async (content) => {
        if (!conflictsFilePath.value) {
            return
        }
        
        await Main.API.writeProjectFile(conflictsFilePath.value, content)

        currentConflictsFile.value.solveConflicts()

        conflictsFilePath.value = ""
        conflictsFileContent.value = ""
        conflictsNewFileContent.value = ""

        Alert.success("Conflicts solved successfully")

        loadFiles()
    }

    const ignoreFile = async (file: RenderableFile) => {
        file.setAsIgnored()

        loadFiles()
    }
</script>

<template>
    <div
        v-if="projectStore.projectIsReady"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-scroll"
    >
        <div class="mt-3">
            <UiTabs 
                ref="uiTabs"
                :name="projectStore.project.getTabNameFor('queue')" 
                :tabs="tabs" 
                v-model="selectedTab" 
            />
        </div>

        <ConflictsSolver 
            can-ignore
            ref="conflictsSolver"
            :relativeFilePath="conflictsFilePath"
            :currentFileContent="conflictsFileContent"
            :newFileContent="conflictsNewFileContent"
            @solved="conflictsSolved"
            @ignored="ignoreFile(currentConflictsFile)"
        />

        <div>
            <div class="p-4" v-show="selectedTab === 'queue'">
                <div v-if="loadingFiles">
                    <UiEmptyMessage loading>
                        <span>Loading files...</span>
                    </UiEmptyMessage>
                </div>
                <div v-else>
                    <UiEmptyMessage v-if="!filteredFiles.length">
                        <span>There are no files in the Queue</span>
                    </UiEmptyMessage>
                </div>
    
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
                
                <div v-if="filteredFiles.length">
                    <RenderableFileViewer
                        v-for="file in filteredFiles"
                        :key="file.id"
                        :file="file"
                        @showConflictsSolver="showConflictsSolver"
                    >
                    </RenderableFileViewer>
                </div>
            </div>
    
            <div class="p-4" v-show="selectedTab === 'conflicts'">
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
                
                <div v-if="conflictFiles.length">
                    <RenderableFileViewer
                        v-for="file in conflictFiles"
                        :key="file.id"
                        :file="file"
                        @showConflictsSolver="showConflictsSolver"
                    >
                    </RenderableFileViewer>
                </div>
            </div>
    
            <div class="p-4" v-show="selectedTab === 'ignored'">
                <UiEmptyMessage v-show="!ignoredFiles.length">
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
                
                <div v-if="ignoredFiles.length">
                    <RenderableFileViewer
                        v-for="file in ignoredFiles"
                        :key="file.id"
                        :file="file"
                        @showConflictsSolver="showConflictsSolver"
                    >
                    </RenderableFileViewer>
                </div>
            </div>
    
            <div class="p-4" v-show="selectedTab === 'removed'">
                <UiEmptyMessage v-show="!removedFiles.length">
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
    
                    <UiButton @click="clearRemovedFiles()">
                        <CubeTransparentIcon class="w-4 h-4 mr-2 text-red-400" />
                        <span>Clear All</span>
                    </UiButton>
                </div>
                
                <div v-if="removedFiles.length">
                    <RenderableFileViewer
                        v-for="file in removedFiles"
                        :key="file.id"
                        :file="file"
                        @showConflictsSolver="showConflictsSolver"
                    >
                    </RenderableFileViewer>
                </div>
            </div>
    
            <div class="p-4" v-show="selectedTab === 'skipped'">
                <UiEmptyMessage v-show="!skippedFiles.length">
                    <span>There are no skipped files</span>
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
                
                <div v-if="skippedFiles.length">
                    <RenderableFileViewer
                        v-for="file in skippedFiles"
                        :key="file.id"
                        :file="file"
                        @showConflictsSolver="showConflictsSolver"
                    >
                    </RenderableFileViewer>
                </div>
            </div>
    
            <div class="p-4" v-show="selectedTab === 'settings'">
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

    </div>
</template>
