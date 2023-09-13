<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { ArrowDownTrayIcon, ArrowRightIcon, CircleStackIcon, MinusIcon, PlusIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { Ref, computed, onMounted, reactive, ref, watch } from "vue"
    import GenerateNewMigration from "@Renderer/codegen/generators/GenerateNewMigration"
    import UpdateExistingMigration from "@Renderer/codegen/generators/UpdateExistingMigration"
    import CalculateSchemaChanges from "@Common/models/services/project/CalculateSchemaChanges"
    import Main from "@Renderer/services/wrappers/Main"
    import Table from "@Common/models/Table"
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"

    const projectStore = useProjectStore(),
        showingModal = ref(false),
        confirmSaveDialog = ref(null)

    const tablesSettings = reactive({} as any)

    const changesCalculator = new CalculateSchemaChanges(projectStore.project)

    const createdTables = ref([]) as Ref<Table[]>,
        changedTables = ref([]) as Ref<Table[]>,
        removedTables = ref([]) as Ref<Table[]>,
        selectedTable = ref(null) as Ref<Table|null>,
        selectedMode = ref("created") as Ref<"created"|"updated"|"removed">

    onMounted(() => {
        buildTablesSettings()
    })

    watch(showingModal, (willShowModal) => {
        if(!willShowModal) return
        
        buildTablesSettings()
        loadFirstTableMigrationContent()
    })

    const selectedTableSettings = computed(() => {
        if(!selectedTable.value) return null
        return tablesSettings[selectedTable.value.name]
    })

    const buildTablesSettings = async () => {
        await resetTablesSettings()

        let allChanges = changesCalculator.getAllChangesWithTable()

        createdTables.value = changesCalculator.getAddedTables()
        changedTables.value = changesCalculator.getChangedTables()
        removedTables.value = changesCalculator.getRemovedTables()

        if(createdTables.value.length) {
            selectedTable.value = createdTables.value[0]
            selectedMode.value = "created"
        } else if(changedTables.value.length) {
            selectedTable.value = changedTables.value[0]
            selectedMode.value = "updated"
        } else if(removedTables.value.length) {
            selectedTable.value = removedTables.value[0]
            selectedMode.value = "removed"
        }

        for (const change of allChanges) {
            const table = change.table

            tablesSettings[table.name] = {
                instance: table,
                latestMigration: table.getLatestMigration(),
                canUpdateLatestMigration: table.canUpdateLatestMigration(),
                canCreateNewMigration: table.canCreateNewMigration(),
                migrationName: "",
                migrationContent: "",
                selectedOption: "createMigration",
            }

            await loadMigrationContent(table.name)
        }
    }

    const resetTablesSettings = () => {
        Object.keys(tablesSettings).forEach((tableName) => {
            delete tablesSettings[tableName]
        })
    }

    const isSelectedTable = (table: Table) => {
        return selectedTable.value && selectedTable.value.id === table.id
    }

    const selectTable = async (table: Table, mode: "created"|"updated"|"removed") => {
        selectedTable.value = table
        selectedMode.value = mode

        await loadMigrationContent(table.name)
    }

    const saveMigrations = async () => {
        
        const confirmed = await confirmSaveDialog.value.confirm()
        if(!confirmed) return

        const tables: any[] = Object.values(tablesSettings)

        for(const table of tables) {
            if (table.selectedOption === "updateMigration") {
                console.log('will update')
                const migrationUpdater = new UpdateExistingMigration(table.instance)
                await migrationUpdater.run()
            }

            if (table.selectedOption === "createMigration") {
                console.log('will create')
                const migrationCreator = new GenerateNewMigration(table.instance)
                await migrationCreator.run()
            }
        }

        showingModal.value = false
    }

    const loadFirstTableMigrationContent = async () => {
        const firstTable = Object.keys(tablesSettings)[0]

        await loadMigrationContent(firstTable)
    }

    const loadMigrationContent = async (tableName: any) => {
        const table = tablesSettings[tableName]

        if (table.selectedOption === "updateMigration") {
            const migrationUpdater = new UpdateExistingMigration(table.instance),
                migrationData = await migrationUpdater.getData()

            table.migrationName = migrationData.name
            table.migrationContent = migrationData.content
        }

        if (table.selectedOption === "createMigration") {
            const migrationCreator = new GenerateNewMigration(table.instance),
                migrationData = await migrationCreator.getData()
            
            table.migrationName = migrationData.name
            table.migrationContent = migrationData.content
        }
    }
</script>

<template>
    <div
        class="absolute bottom-0 left-0 p-4"
        style="z-index: 60;"
        v-if="projectStore.project.hasSchemaChanges()"
    >
        <div class="flex flex-col space-y-2 bg-slate-850 border border-slate-700 p-3 rounded-lg">
            <div class="flex items-center space-x-1 text-sm">
                <!-- <div class="rounded-full w-3 h-3 bg-red-500 animate-pulse"></div> -->
                <div>There are tables changes</div>
            </div>
            <div>
                <UiButton
                    class="flex items-center justify-between"
                    @click="showingModal = true"
                >
                    <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                    Save
                </UiButton>
            </div>
        </div>

        <UiConfirm ref="confirmSaveDialog">
            Are you sure you want to save migrations?
        </UiConfirm>

        <UiModal
            title="Review Migrations"
            :show="showingModal"
            @close="showingModal = false"
            width="1500px"
            height="calc(100vh - 5rem)"
        >
            <section class="flex h-full">
                <!-- Tables Selector -->
                <div class="w-1/5 text-slate-400">
                    <div class="flex items-center p-2 bg-slate-950 text-slate-200">
                        <PlusIcon class="w-4 h-4 mr-2" />
                        Created Tables
                    </div>

                    <div @click.stop="selectTable(table, 'created')" :class="{'text-red-400 bg-slate-800': isSelectedTable(table)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer" v-for="table in createdTables" :key="table.id">
                        {{ table.name }}
                    </div>

                    <div class="flex items-center p-2 bg-slate-950 text-slate-200">
                        <CircleStackIcon class="w-4 h-4 mr-2" />
                        Changed Tables
                    </div>

                    <div @click.stop="selectTable(table, 'updated')" :class="{'text-red-400 bg-slate-800': isSelectedTable(table)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer" v-for="table in changedTables" :key="table.id">
                        <div title="Table was renamed" class="flex items-center space-x-1" v-if="table.wasRenamed()">
                            <span class="text-slate-500">{{ table.schemaState.name }}</span>
                            <ArrowRightIcon class="w-4 h-4" />
                            <span>{{ table.name }}</span>
                        </div>
                        <div v-else>
                            {{ table.name }}
                        </div>
                    </div>

                    <div class="flex items-center p-2 bg-slate-950 text-slate-200">
                        <MinusIcon class="w-4 h-4 mr-2" />
                        Removed Tables
                    </div>

                    <div @click.stop="selectTable(table, 'removed')" :class="{'text-red-400 bg-slate-800': isSelectedTable(table)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer" v-for="table in removedTables" :key="table.id">
                        {{ table.name }}
                    </div>
                </div>

                <!-- Migrations -->
                <div class="w-4/5">
                    <div
                        v-if="selectedTableSettings"
                        class="bg-slate-800 w-full h-full overflow-y-scroll"
                    >
                        <div class="flex p-4">
                            <div class="w-56 p-4 space-y-4">
                                <div v-if="selectedTableSettings.canCreateNewMigration">
                                    <input
                                        class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                        type="radio"
                                        value="createMigration"
                                        v-model="selectedTableSettings.selectedOption"
                                        @change="loadMigrationContent(selectedTableSettings.instance.name)"
                                    />
                                    <label>Create new migration</label>
                                </div>

                                <div v-if="selectedTableSettings.canUpdateLatestMigration">
                                    <input
                                        class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                        type="radio"
                                        value="updateMigration"
                                        v-model="selectedTableSettings.selectedOption"
                                        @change="loadMigrationContent(selectedTableSettings.instance.name)"
                                    />
                                    <label
                                        >Update latest migration
                                    </label>
                                </div>
                            </div>
    
                            <div class="p-2 flex-grow space-y-2">
                                <UiText v-model="selectedTableSettings.migrationName" :disabled="selectedTableSettings.selectedOption === 'updateMigration'" />
                                <highlightjs class="h-full" language="php" :code="selectedTableSettings.migrationContent" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <template #footer>
                <div class="flex justify-end p-4">
                    <UiButton @click="saveMigrations">Save Migrations</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>
