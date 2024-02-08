<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { ArrowDownOnSquareIcon, ArrowDownTrayIcon, ArrowPathIcon, ArrowRightIcon, ArrowUturnDownIcon, CircleStackIcon, CodeBracketIcon, DocumentIcon, MinusIcon, PlusIcon, TableCellsIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { Ref, computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"
    import GenerateNewMigration from "@Renderer/codegen/generators/GenerateNewMigration"
    import UpdateExistingMigration from "@Renderer/codegen/generators/UpdateExistingMigration"
    import CalculateSchemaTablesChanges from "@Common/models/services/project/CalculateSchemaTablesChanges"
    import CalculateSchemaModelsChanges from "@Common/models/services/project/CalculateSchemaModelsChanges"
    import Table from "@Common/models/Table"
    import Model from "@Common/models/Model"
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import SchemaBuilder from "@Renderer/services/schema/SchemaBuilder"
    import UiLoading from "@Renderer/components/ui/UiLoading.vue"
    import RenderableModel from "@Renderer/codegen/sequential/services/model/RenderableModel"
    import Main from "@Renderer/services/wrappers/Main"
    import ConflictsSolver from "../CodeQueue/ConflictsSolver.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import InternalFiles from "@Renderer/util/InternalFiles"
    import MigrationOrganizer from "@Renderer/services/table/MigrationOrganizer"

    const projectStore = useProjectStore(),
        showingModal = ref(false),
        confirmSaveDialog = ref(null),
        confirmUndoDialog = ref(null),
        confirmDeleteDialog = ref(null),
        savingSchemaChanges = ref(false),
        currentReviewingMode = ref("table") as Ref<"table"|"model">,
        conflictsSolver = ref(null)

    const tablesSettings = reactive({} as any),
        modelsSettings = reactive({} as any)

    const tablesChangesCalculator = new CalculateSchemaTablesChanges(projectStore.project),
        modelsChangesCalculator = new CalculateSchemaModelsChanges(projectStore.project)

    const createdTables = ref([]) as Ref<Table[]>,
        changedTables = ref([]) as Ref<Table[]>,
        removedTables = ref([]) as Ref<Table[]>,
        selectedTable = ref(null) as Ref<Table|null>,
        selectedTableMode = ref("created") as Ref<"created"|"updated"|"removed">

    const createdModels = ref([]) as Ref<Model[]>, 
        changedModels = ref([]) as Ref<Model[]>,
        removedModels = ref([]) as Ref<Model[]>,
        selectedModel = ref(null) as Ref<Model|null>,
        selectedModelMode = ref("created") as Ref<"created"|"updated"|"removed">

    onMounted(() => {

        const organizer = new MigrationOrganizer(projectStore.project)
        
        console.log(organizer.getTablesNames())

        buildSettings()
    })

    onUnmounted(() => {
        close()
    })

    watch(showingModal, async (willShowModal) => {
        if(!willShowModal) return
        
        await buildSettings()
        await selectFirstTableOrModel()

        SchemaBuilder.disableSchemaChangesCheck()
    })

    watch(() => projectStore.hasSchemaChanges, async (hasChanges) => {
        if(!hasChanges) close()
    })

    const selectedTableSettings = computed(() => {
        if(!selectedTable.value) return null
        return tablesSettings[selectedTable.value.name]
    })

    const selectedModelSettings = computed(() => {
        if(!selectedModel.value) return null
        return modelsSettings[selectedModel.value.id]
    })
    
    const buildSettings = async () => {
        await buildTablesSettings()
        await buildModelsSettings()
    }

    const buildTablesSettings = async () => {
        await resetTablesSettings()

        let allChanges = tablesChangesCalculator.getAllChangesWithTable()

        createdTables.value = tablesChangesCalculator.getAddedTables()
        changedTables.value = tablesChangesCalculator.getChangedTables()
        removedTables.value = tablesChangesCalculator.getRemovedTables()

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

    const buildModelsSettings = async () => {
        await resetModelsSettings()

        let allChanges = modelsChangesCalculator.getAllChangesWithModel()

        createdModels.value = modelsChangesCalculator.getAddedModels()
        changedModels.value = modelsChangesCalculator.getChangedModels()
        removedModels.value = modelsChangesCalculator.getRemovedModels()

        for (const change of allChanges) {
            const model = change.model,
                renderable = new RenderableModel(model)

            modelsSettings[model.id] = {
                instance: model,
                renderable: renderable,
                hasConflicts: false,
                currentModelContent: "",
                newModelContent: "",
                acceptedModelContent: "",
            }

            await loadModelContent(model)
        }
    }

    const modelHasConflicts = (model: Model) => {
        if(!modelsSettings[model.id]) return false

        return modelsSettings[model.id].hasConflicts
    }

    const resetModelsSettings = () => {
        Object.keys(modelsSettings).forEach((modelId) => {
            delete modelsSettings[modelId]
        })
    }

    const isSelectedTable = (table: Table) => {
        return selectedTable.value && selectedTable.value.id === table.id
    }

    const isSelectedModel = (model: Model) => {
        return selectedModel.value && selectedModel.value.id === model.id
    }

    const selectTable = async (table: Table, mode: "created"|"updated"|"removed") => {
        currentReviewingMode.value = "table"
        selectedTable.value = table
        selectedTableMode.value = mode

        selectedModel.value = null

        await loadMigrationContent(table.name)
    }

    const selectModel = async (model: Model, mode: "created"|"updated"|"removed") => {
        currentReviewingMode.value = "model"
        selectedModel.value = model
        selectedModelMode.value = mode

        selectedTable.value = null

        await loadModelContent(model)
    }

    const saveSchemaChanges = async () => {
        if(hasConflicts()) {
            Alert.warning("There are conflicts in your files. Please solve them before saving.")
            return
        }

        const confirmed = await confirmSaveDialog.value.confirm()
        if(!confirmed) return

        savingSchemaChanges.value = true

        await saveMigrations()
        await saveModels()

        await readSchema()

        savingSchemaChanges.value = false

        close()
    }

    const hasConflicts = () => {
        return Object.values(modelsSettings).some((modelSettings: any) => {
            return modelSettings.hasConflicts
        })
    }

    const saveMigrations = async () => {
        const tables: any[] = Object.values(tablesSettings)

        for(const table of tables) {
            if (table.selectedOption === "updateMigration") {
                const migrationUpdater = new UpdateExistingMigration(table.instance)
                await migrationUpdater.run()
            }

            if (table.selectedOption === "createMigration") {
                const migrationCreator = new GenerateNewMigration(table.instance)
                await migrationCreator.run()
            }
        }
    }

    const saveModels = async () => {
        const models: any[] = Object.values(modelsSettings)

        for(const model of models) {
            const renderable = model.renderable

            
            await InternalFiles.writeGeneratedFile(renderable.getFullFilePath(), model.newModelContent)
            await Main.API.writeProjectFile(renderable.getFullFilePath(), model.acceptedModelContent)
            
            model.instance.fillHooksForFutureComparison()
        }
    }

    const readSchema = async () => {
        projectStore.project.ignoreNextSchemaSourceChanges()

        const schemaBuilder = new SchemaBuilder(projectStore.project)

        await schemaBuilder.buildTables()
        await schemaBuilder.buildModels()
    }

    const selectFirstTableOrModel = async () => {
        const firstTable = Object.keys(tablesSettings)[0],
            firstModel = Object.keys(modelsSettings)[0]

        if(firstTable) {
            await loadMigrationContent(firstTable)
            await selectTable(tablesSettings[firstTable].instance, "created")
            return
        }

        if(firstModel) {
            await loadModelContent(modelsSettings[firstModel].instance)
            await selectModel(modelsSettings[firstModel].instance, "created")
            return
        }
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

    const loadModelContent = async (model: any) => {
        const modelSettings = modelsSettings[model.id]

        const renderableModel = new RenderableModel(model),
            modelPath = renderableModel.getFullFilePath(), 
            currentModelContent = model.isNew() ? "" : await Main.API.readProjectFile(modelPath),
            newModelContent = await new RenderableModel(model).compileWithErrorThreatment()

        modelSettings.newModelContent = newModelContent
        modelSettings.acceptedModelContent = newModelContent
        modelSettings.currentModelContent = currentModelContent

        const hasConflicts = await Main.API.fileHasConflicts(modelPath, newModelContent)
        modelSettings.hasConflicts = hasConflicts
    }

    const resetModel = async () => {
        loadModelContent(selectedModel.value)
    }

    const modelConflictSolved = async (content) => {
        selectedModelSettings.value.acceptedModelContent = content
        selectedModelSettings.value.hasConflicts = false
    }

    const undoTableChanges = async (table: Table) => {
        const confirmed = await confirmUndoDialog.value.confirm()
        if(!confirmed) return

        await table.undoAllChanges()
        await buildTablesSettings()
    }

    const deleteTable = async (table: Table) => {
        const confirmed = await confirmDeleteDialog.value.confirm()
        if(!confirmed) return

        await table.delete()
        await buildTablesSettings()
    }

    const close = () => {
        showingModal.value = false
        currentReviewingMode.value = "table"
        selectedTable.value = null
        selectedModel.value = null

        SchemaBuilder.enableSchemaChangesCheck()
    }
</script>

<template>
    <Transition
        enter-from-class="transition duration-300 opacity-0"
        enter-to-class="transition duration-300 opacity-100"
        leave-from-class="transition duration-300 opacity-100"
        leave-to-class="transition duration-300 opacity-0"
    >
        <div
            class="absolute bottom-0 left-0 p-4"
            style="z-index: 60;"
            v-if="projectStore.project.hasSchemaChanges()"
        >
            <div class="flex flex-col space-y-2 bg-slate-850 border border-slate-700 rounded-lg">
                <div class="flex items-center space-x-1 text-sm pt-3 pb-3 px-3 bg-slate-800 rounded-t-lg text-slate-300">
                    <!-- <div class="rounded-full w-3 h-3 bg-red-500 animate-pulse"></div> -->
                    <div>There are schema changes</div>
                </div>
                <div class="pt-1 pb-3 px-3">
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
                Are you sure you want to save all schema changes?
            </UiConfirm>

            <UiConfirm ref="confirmUndoDialog">
                Are you sure you want to undo table changes?
            </UiConfirm>

            <UiConfirm ref="confirmDeleteDialog">
                Are you sure you want to delete this table?
            </UiConfirm>

            <UiModal
                title="Review schema changes"
                :show="showingModal"
                @close="close()"
                width="1500px"
                height="calc(100vh - 5rem)"
            >
                <section
                    :class="{
                        'opacity-30 pointer-events-none': savingSchemaChanges,
                    }"
                    class="flex h-full"
                >
                    <!-- Changes Selector -->
                    <div class="w-1/5 text-slate-300 bg-slate-950">
                        <div class="flex items-center p-2 bg-slate-990 text-slate-200">
                            <TableCellsIcon class="w-4 h-4 mr-2" />
                            Tables
                        </div>

                        <div class="flex items-center p-2 bg-slate-950 text-slate-500">
                            <PlusIcon class="w-4 h-4 mr-2" />
                            Created Tables
                        </div>
                        <div @click.stop="selectTable(table, 'created')" :class="{'text-red-400 bg-slate-800': isSelectedTable(table)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer flex justify-between items-center" v-for="table in createdTables" :key="table.id">
                            <div>
                                {{ table.name }}
                            </div>

                            <button class="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60" title="Delete table">
                                <TrashIcon
                                    class="w-4 h-4 text-slate-400 hover:text-red-500"
                                    @click.stop.prevent="deleteTable(table)" />
                            </button>
                        </div>

                        <div class="flex items-center p-2 bg-slate-950 text-slate-500">
                            <CircleStackIcon class="w-4 h-4 mr-2" />
                            Changed Tables
                        </div>
                        <div @click.stop="selectTable(table, 'updated')" :class="{'text-red-400 bg-slate-800': isSelectedTable(table)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer flex justify-between items-center" v-for="table in changedTables" :key="table.id">
                            <div>
                                <div title="Table was renamed" class="flex items-center space-x-1" v-if="table.wasRenamed()">
                                    <span class="text-slate-500">{{ table.schemaState.name }}</span>
                                    <ArrowRightIcon class="w-4 h-4" />
                                    <span>{{ table.name }}</span>
                                </div>
                                <div v-else>
                                    {{ table.name }}
                                </div>
                            </div>

                            <div title="Undo table changes">
                                <ArrowUturnDownIcon
                                    class="w-5 h-5  cursor-pointer text-slate-400 hover:text-red-500"
                                    @click.stop.prevent="undoTableChanges(table)" />
                            </div>
                        </div>

                        <div class="flex items-center p-2 bg-slate-950 text-slate-500">
                            <MinusIcon class="w-4 h-4 mr-2" />
                            Removed Tables
                        </div>
                        <div @click.stop="selectTable(table, 'removed')" :class="{'text-red-400 bg-slate-800': isSelectedTable(table)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer flex justify-between items-center" v-for="table in removedTables" :key="table.id">
                            <div>
                                {{ table.name }}
                            </div>

                            <div title="Undo table changes">
                                <ArrowUturnDownIcon
                                    class="w-5 h-5  cursor-pointer text-slate-400 hover:text-red-500"
                                    @click.stop.prevent="undoTableChanges(table)" />
                            </div>
                        </div>

                        <!-- Models -->
                        <div class="flex items-center p-2 bg-slate-990 text-slate-200 border-t border-slate-800">
                            <DocumentIcon class="w-4 h-4 mr-2" />
                            Models
                        </div>
                        <div class="flex items-center p-2 bg-slate-950 text-slate-500">
                            <PlusIcon class="w-4 h-4 mr-2" />
                            Created Models
                        </div>
                        <div @click.stop="selectModel(model, 'created')" :class="{'text-red-400 bg-slate-800': isSelectedModel(model)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer flex justify-between items-center" v-for="model in createdModels" :key="model.id">
                            <div>
                                <div title="Model was renamed" class="flex items-center space-x-1" v-if="model.wasRenamed()">
                                    <span class="text-slate-500">{{ model.schemaState.name }}</span>
                                    <ArrowRightIcon class="w-4 h-4" />
                                    <span>{{ model.name }}</span>
                                </div>
                                <div v-else>
                                    {{ model.name }}
                                </div>
                            </div>

                            <!-- <div title="Undo table changes">
                                <ArrowUturnDownIcon
                                    class="w-5 h-5  cursor-pointer text-slate-400 hover:text-red-500"
                                    @click.stop.prevent="undoTableChanges(table)" />
                            </div> -->
                        </div>
                        
                        <div class="flex items-center p-2 bg-slate-950 text-slate-500">
                            <CircleStackIcon class="w-4 h-4 mr-2" />
                            Changed Models
                        </div>
                        <div @click.stop="selectModel(model, 'updated')" :class="{'text-red-400 bg-slate-800': isSelectedModel(model)}" class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer flex justify-between items-center" v-for="model in changedModels" :key="model.id">
                            <div class="flex w-full items-center justify-between">
                                <div title="Model was renamed" class="flex items-center space-x-1" v-if="model.wasRenamed()">
                                    <span class="text-slate-500">{{ model.schemaState.name }}</span>
                                    <ArrowRightIcon class="w-4 h-4" />
                                    <span>{{ model.name }}</span>
                                </div>
                                <div v-else>
                                    {{ model.name }}
                                </div>

                                <div class="flex space-x-1">
                                    <div class="text-xs text-slate-300 bg-slate-990 py-1 px-2 rounded-md" v-if="modelHasConflicts(model)">
                                        Has conflicts
                                    </div>
    
                                    <div class="text-xs text-slate-300 bg-slate-990 py-1 px-2 rounded-md" v-if="model.hasHooksChanges()">
                                        Hooks Changed
                                    </div>
                                </div>
                            </div>
<!-- 
                            <div title="Undo table changes">
                                <ArrowUturnDownIcon
                                    class="w-5 h-5  cursor-pointer text-slate-400 hover:text-red-500"
                                    @click.stop.prevent="undoTableChanges(table)" />
                            </div> -->
                        </div>

                        <div class="flex items-center p-2 bg-slate-950 text-slate-500">
                            <MinusIcon class="w-4 h-4 mr-2" />
                            Removed Models
                        </div>
                        <div class="px-5 py-1 hover:text-red-400 hover:bg-slate-800 hover:cursor-pointer flex justify-between items-center" v-for="model in removedModels" :key="model.id">
                            <div>
                                <div title="Model was renamed" class="flex items-center space-x-1" v-if="model.wasRenamed()">
                                    <span class="text-slate-500">{{ model.schemaState.name }}</span>
                                    <ArrowRightIcon class="w-4 h-4" />
                                    <span>{{ model.name }}</span>
                                </div>
                                <div v-else>
                                    {{ model.name }}
                                </div>
                            </div>

                            <!-- <div title="Undo table changes">
                                <ArrowUturnDownIcon
                                    class="w-5 h-5  cursor-pointer text-slate-400 hover:text-red-500"
                                    @click.stop.prevent="undoTableChanges(table)" />
                            </div> -->
                        </div>
                    </div>

                    <!-- Migrations -->
                    <div v-if="currentReviewingMode === 'table'" class="w-4/5">
                        <div
                            v-if="selectedTableSettings"
                            class="bg-slate-800 w-full h-full overflow-y-scroll"
                        >
                            <div class="flex p-4">
                                <div class="w-56 p-2 space-y-4">
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

                    <!-- Model -->
                    <div v-if="currentReviewingMode === 'model'" class="w-4/5">
                        <div
                            v-if="selectedModelSettings"
                            class="bg-slate-800 w-full h-full overflow-y-scroll"
                        >
                            <div class="p-2 flex-grow space-y-2">
                                <div class="flex items-center justify-between">
                                    <div class="text-slate-500 italic text-sm">
                                        {{ selectedModelSettings.instance.getClassString() }}
                                    </div>
                                    <div class="flex justify-end space-x-0.5">
                                        <UiButton
                                            :disabled="!selectedModelSettings.hasConflicts"
                                            class="flex items-center justify-between"
                                            @click="conflictsSolver.show()"
                                        >
                                            <CodeBracketIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                                            Solve Conflicts
                                        </UiButton>
    
                                        <ConflictsSolver 
                                            ref="conflictsSolver"
                                            :relativeFilePath="selectedModelSettings.renderable.getFullFilePath()"
                                            :currentFileContent="selectedModelSettings.currentModelContent"
                                            :newFileContent="selectedModelSettings.newModelContent"
                                            @solved="modelConflictSolved"
                                        />
                                        <UiButton @click="resetModel()">
                                            <ArrowPathIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                                            Reset
                                        </UiButton>
                                    </div>
                                </div>
                                <highlightjs class="h-full" language="php" :code="selectedModelSettings.acceptedModelContent" />
                            </div>
                        </div>
                    </div>
                </section>

                <template #footer>
                    <div class="flex justify-end p-2">
                        <UiButton :disabled="savingSchemaChanges" @click="saveSchemaChanges">
                            <div class="flex space-x-1" v-if="savingSchemaChanges">
                                <UiLoading></UiLoading> 
                                <div>Saving...</div>
                            </div>
                            <div class="flex items-center" v-else>
                                <ArrowDownTrayIcon class="w-4 h-4 mr-1 stroke-2 text-red-500" />
                                Save changes
                            </div>
                        </UiButton>
                    </div>
                </template>
            </UiModal>
        </div>
    </Transition>
</template>