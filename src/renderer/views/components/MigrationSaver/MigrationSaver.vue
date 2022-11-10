<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { onMounted, reactive, ref, watch } from "vue"
    import GenerateNewMigration from "@Renderer/codegen/generators/GenerateNewMigration"
    import UpdateExistingMigration from "@Renderer/codegen/generators/UpdateExistingMigration"

    const projectStore = useProjectStore(),
        showingModal = ref(false),
        tablesSettings = reactive({} as any)

    onMounted(() => {
        buildTablesSettings()
    })

    watch(showingModal, (willShowModal) => {
        if(!willShowModal) return

        buildTablesSettings()
    })

    const buildTablesSettings = () => {
        let changedTables = projectStore.project.getChangedTables()

        changedTables.forEach((table) => {
            tablesSettings[table.name] = {
                instance: table,
                latestMigration: table.getLatestMigration(),
                canUpdateLatestMigration: table.canUpdateLatestMigration(),
                canCreateNewMigration: table.canCreateNewMigration(),

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
</script>

<template>
    <div
        class="absolute bottom-0 left-0 p-4"
        v-if="projectStore.project.hasChangedTables()"
    >
        <UiButton
            class="flex items-center justify-between"
            @click="showingModal = true"
        >
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Save
        </UiButton>

        <UiModal
            title="Review Migrations"
            :show="showingModal"
            @close="showingModal = false"
        >
            <section class="p-4 space-y-4">
                <div
                    class="bg-slate-800 rounded-lg"
                    v-for="table in tablesSettings"
                    :key="table.instance.id"
                >
                    <header class="p-4">
                        Table
                        <span class="text-red-500 dark:text-red-400">{{
                            table.instance.name
                        }}</span>
                    </header>

                    <div class="p-4 space-y-4">
                        <div v-if="table.canUpdateLatestMigration">
                            <input
                                class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                type="radio"
                                value="update"
                                v-model="table.selectedOption"
                            />
                            <label
                                >Update latest migration
                                <span
                                    :title="table.latestMigration.relativePath"
                                    class="text-green-500 py-1 px-2 ml-0.5 bg-slate-900 rounded"
                                    >{{
                                        table.latestMigration.migrationName
                                    }}</span
                                >
                            </label>
                        </div>

                        <div v-if="table.canCreateNewMigration">
                            <input
                                class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                type="radio"
                                value="create"
                                v-model="table.selectedOption"
                            />
                            <label>Create new migration</label>
                        </div>

                        <div>
                            <input
                                class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2"
                                type="radio"
                                value="skip"
                                v-model="table.selectedOption"
                            />
                            <label>Don't generate migration</label>
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
