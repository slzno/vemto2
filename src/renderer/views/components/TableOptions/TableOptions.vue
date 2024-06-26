<script setup lang="ts">
    import { toRef, ref, watch, Ref } from "vue"
    import TableIndexes from "./TableIndexes.vue"
    import TableSettings from "./TableSettings.vue"
    import { XMarkIcon } from "@heroicons/vue/24/outline"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import TableModels from "../TableOptions/TableModels.vue"
    import TableColumns from "../TableOptions/TableColumns.vue"
    import TableMigrations from "./TableMigrations.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const props = defineProps({
        show: Boolean,
    })

    const show = toRef(props, "show"),
        uiTabs = ref(null),
        schemaStore = useSchemaStore(),
        projectStore = useProjectStore(),
        loadingTables = ref(false),
        loadingModels = ref(false),
        loadingIndexes = ref(false)

    const selectedTab = ref("columns"),
        tableOptionsModal = ref(null)

    const tabs = [
        { label: "Columns", value: "columns" },
        { label: "Models", value: "models" },
        { label: "Indexes", value: "indexes" },
        { label: "Migrations", value: "migrations" },
        { label: "Settings", value: "settings" },
    ]

    watch(loadingTables, (value) => {
        uiTabs.value.setLoadingTab("columns", value)
    })

    watch(loadingModels, (value) => {
        uiTabs.value.setLoadingTab("models", value)
    })

    watch(loadingIndexes, (value) => {
        uiTabs.value.setLoadingTab("indexes", value)
    })
</script>

<template>
    <!-- Transition animation from bottom to top -->
    <Transition
        enter-from-class="transition duration-200 translate-y-full"
        enter-to-class="transition duration-200 translate-y-0"
        leave-from-class="transition duration-200 translate-y-0"
        leave-to-class="transition duration-200 translate-y-full"
    >
        <div
            ref="tableOptionsModal"
            class="fixed right-0 bottom-0 h-screen pt-16 px-4 z-50 text-slate-200 cursor-default"
            style="width: 42rem"
            v-if="show && schemaStore.hasSelectedTable"
            v-shortkey="['esc']" @shortkey="schemaStore.deselectTable()"
        >
            <div
                class="relative rounded-t-lg bg-slate-850 w-full shadow-2xl border-t border-l border-r border-slate-700 h-full"
            >
                <div class="flex flex-col h-full">
                    <div>
                        <div class="flex justify-between bg-slate-800 rounded-t-lg">
                            <div class="flex flex-col p-4 pb-4">
                                <span class="font-thin font-lg">
                                    Table Options (<span class="text-red-400 px-1">{{ schemaStore.selectedTable.name }}</span>)
                                </span>
                            </div>
                        </div>
        
                        <button
                            class="cursor-pointer flex absolute top-2 right-2"
                            @click="schemaStore.deselectTable()"
                        >
                            <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                        </button>
        
                        <UiTabs
                            ref="uiTabs"
                            :name="projectStore.project.getTabNameFor(`table${schemaStore.selectedTable.id}`)" 
                            :tabs="tabs" 
                            v-model="selectedTab" 
                            background-class="bg-slate-800" 
                            selected-class="bg-slate-850"  
                        />
                    </div>
    
                    <div class="flex-grow overflow-y-scroll pb-40">
                        <div class="p-4 space-y-2" v-if="selectedTab === 'columns'">
                            <TableColumns 
                                :table="schemaStore.selectedTable" 
                                @loading="loadingTables = $event"
                            />
                        </div>
        
                        <div class="p-4 space-y-2" v-if="selectedTab === 'models'">
                            <TableModels 
                                :table="schemaStore.selectedTable" 
                                @loading="loadingModels = $event"
                            />
                        </div>
        
                        <div class="p-4 space-y-2" v-if="selectedTab === 'indexes'">
                            <TableIndexes 
                                :table="schemaStore.selectedTable" 
                                @loading="loadingIndexes = $event"
                            />
                        </div>
        
                        <div class="p-4 space-y-2" v-if="selectedTab === 'settings'">
                            <TableSettings :table="schemaStore.selectedTable" />
                        </div>

                        <div class="p-4 space-y-2" v-if="selectedTab === 'migrations'">
                            <TableMigrations :table="schemaStore.selectedTable" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped></style>
