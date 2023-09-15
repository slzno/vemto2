<script setup lang="ts">
    import { toRef, ref, onMounted } from "vue"
    import TableIndexes from "./TableIndexes.vue"
    import TableSettings from "./TableSettings.vue"
    import { XMarkIcon } from "@heroicons/vue/24/outline"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import TableModels from "../TableOptions/TableModels.vue"
    import TableColumns from "../TableOptions/TableColumns.vue"
    import TableMigrations from "./TableMigrations.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"

    const props = defineProps({
        show: Boolean,
    })

    const show = toRef(props, "show"),
        schemaStore = useSchemaStore()

    const selectedTab = ref("columns"),
        tableOptionsModal = ref(null)

    const tabs = [
        { label: "Columns", value: "columns" },
        { label: "Models", value: "models" },
        { label: "Indexes", value: "indexes" },
        { label: "Settings", value: "settings" },
        { label: "Migrations", value: "migrations" },
    ]
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
            class="fixed right-0 bottom-0 h-screen pt-10 px-4 z-50 text-slate-200 cursor-default"
            style="width: 38rem"
            v-if="show && schemaStore.hasSelectedTable"
        >
            <div
                class="relative rounded-t-lg bg-slate-850 w-full shadow-2xl border-t border-l border-r border-slate-600 h-full"
            >
                <div class="flex flex-col h-full">
                    <div>
                        <div class="flex justify-between bg-slate-800 p-4 rounded-t-lg">
                            <div class="flex flex-col">
                                <span class="font-semibold">Table Options</span>
                                <div class="text-red-400">{{ schemaStore.selectedTable.name }}</div>
                            </div>
                        </div>
        
                        <button
                            class="cursor-pointer flex absolute top-2 right-2"
                            @click="schemaStore.deselectTable()"
                        >
                            <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                        </button>
        
                        <UiTabs :tabs="tabs" v-model="selectedTab" />
                    </div>
    
                    <div class="flex-grow overflow-auto pb-40">
                        <div class="p-4 space-y-2" v-if="selectedTab === 'columns'">
                            <TableColumns :table="schemaStore.selectedTable" />
                        </div>
        
                        <div class="p-4 space-y-2" v-if="selectedTab === 'models'">
                            <TableModels :table="schemaStore.selectedTable" />
                        </div>
        
                        <div class="p-4 space-y-2" v-if="selectedTab === 'indexes'">
                            <TableIndexes :table="schemaStore.selectedTable" />
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
