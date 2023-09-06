<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { onMounted, reactive, ref, watch } from "vue"
    import GenerateNewMigration from "@Renderer/codegen/generators/GenerateNewMigration"
    import UpdateExistingMigration from "@Renderer/codegen/generators/UpdateExistingMigration"
    import CalculateSchemaChanges from "@Common/models/services/project/CalculateSchemaChanges"

    const projectStore = useProjectStore(),
        showingModal = ref(false),
        tablesSettings = reactive({} as any)
        // selectedTable = ref("")

    const changesCalculator = new CalculateSchemaChanges(projectStore.project)

    onMounted(() => {
        buildTablesSettings()

        console.log(changesCalculator.calculate())
    })

    watch(showingModal, (willShowModal) => {
        if(!willShowModal) return
        
        buildTablesSettings()
        loadFirstTableMigrationContent()
    })

    const buildTablesSettings = () => {
        let changedTables = projectStore.project.getChangedTables()

        changedTables.forEach((table) => {
            tablesSettings[table.name] = {
                instance: table,
                latestMigration: table.getLatestMigration(),
                canUpdateLatestMigration: table.canUpdateLatestMigration(),
                canCreateNewMigration: table.canCreateNewMigration(),
                migrationName: "",
                migrationContent: "",

                selectedOption: table.canUpdateLatestMigration()
                    ? "update"
                    : "create",
            }
        })
    }

    const saveMigrations = () => {
        const tables = Object.values(tablesSettings)

        tables.forEach((table: any) => {
            if (table.selectedOption === "update") {
                UpdateExistingMigration.setTable(table.instance).run()
            }

            if (table.selectedOption === "create") {
                GenerateNewMigration.setTable(table.instance).run()
            }
        })

        showingModal.value = false
    }

    const loadFirstTableMigrationContent = async () => {
        const firstTable = Object.keys(tablesSettings)[0]

        loadMigrationContent(firstTable)
    }

    const loadMigrationContent = async (tableName: any) => {
        const table = tablesSettings[tableName]

        if (table.selectedOption === "update") {
            const migrationData = await UpdateExistingMigration.setTable(table.instance).getData()
            table.migrationName = migrationData.name
            table.migrationContent = migrationData.content
        }

        if (table.selectedOption === "create") {
            const migrationData = await GenerateNewMigration.setTable(table.instance).getData()
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

        <UiModal
            title="Review Migrations"
            :show="showingModal"
            @close="showingModal = false"
            width="1200px"
        >
            <section class="p-4 space-y-4">
                <div
                    class="bg-slate-800 rounded-lg"
                    v-for="table in tablesSettings"
                    :key="table.instance.id"
                >
                    <header class="py-4 px-4">
                        Table
                        <span class="text-red-500 dark:text-red-400">{{
                            table.instance.name
                        }}</span>
                    </header>

                    <div class="flex p-4">
                        <div class="p-4 space-y-4">
                            <div v-if="table.canUpdateLatestMigration">
                                <input
                                    class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                    type="radio"
                                    value="update"
                                    v-model="table.selectedOption"
                                    @change="loadMigrationContent(table.instance.name)"
                                />
                                <label
                                    >Update latest migration
                                    <!-- <span
                                        :title="table.latestMigration.relativePath"
                                        class="text-green-500 py-1 px-2 ml-0.5 bg-slate-900 rounded"
                                        >{{
                                            table.latestMigration.migrationName
                                        }}</span
                                    > -->
                                </label>
                            </div>
    
                            <div v-if="table.canCreateNewMigration">
                                <input
                                    class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                    type="radio"
                                    value="create"
                                    v-model="table.selectedOption"
                                    @change="loadMigrationContent(table.instance.name)"
                                />
                                <label>Create new migration</label>
                            </div>
    
                            <!-- <div>
                                <input
                                    class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                    type="radio"
                                    value="skip"
                                    v-model="table.selectedOption"
                                />
                                <label>Don't generate migration</label>
                            </div> -->
                        </div>

                        <div class="p-2 flex-grow space-y-2">
                            <UiText v-model="table.migrationName" :disabled="table.selectedOption === 'update'" />
                            <!-- <textarea class="bg-slate-950 rounded-lg border-none w-full text-slate-200 text-lg font-mono" spellcheck="false" autocomplete="false" rows="16"></textarea> -->
                            <highlightjs language="php" :code="table.migrationContent" />
                        </div>
                    </div>
                </div>
            </section>

            <template #footer>
                <div class="flex justify-end p-4">
                    <UiButton @click="saveMigrations">Save</UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>
