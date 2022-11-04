<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { onMounted, reactive, ref } from "vue"
import Table from "@Renderer/../common/models/Table"
// import UiRadio from "@Renderer/components/ui/UiRadio.vue"
    import TemplateCompiler from "@Renderer/codegen/templates/base/TemplateCompiler"

    const projectStore = useProjectStore(),
        showingModal = ref(true),
        tablesSettings = reactive({} as any)

    onMounted(() => {
        let changedTables = projectStore.project.getChangedTables()

        changedTables.forEach((table) => {
            tablesSettings[table.name] = {
                id: table.id,
                name: table.name,
                latestMigration: table.getLatestMigration(),
                canUpdateLatestMigration: table.canUpdateLatestMigration(),
                canCreateNewMigration: table.canCreateNewMigration(),
                
                selectedOption: table.canUpdateLatestMigration()
                    ? "update"
                    : "create",
            }
        })
    })

    const saveMigrations = () => {
        const tables = Object.values(tablesSettings)

        tables.forEach((table: any) => {
            if (table.selectedOption === "update") {
                updateLatestMigration(table.id)
            }
        })

        // projectStore.project.saveMigrations()
        showingModal.value = false
    }

    const updateLatestMigration = async (tableId: string) => {
        const table = projectStore.project.findTableById(tableId),
            latestMigration = table.getLatestMigration()
        
        const fileContent = await generateLatestMigrationUpdate(table)

        console.log(fileContent)

        window.api.addFileToGenerationQueue(latestMigration.relativePath.replace('.php', '.phpa'), fileContent)

        console.log('UPDATED')

        // projectStore.project.removeTableFromChangedTables(table)
    }

    const generateLatestMigrationUpdate = async (table: Table) => {
        const latestMigration = table.getLatestMigration(),
            latestMigrationContent = await window.api.readProjectFile(latestMigration.relativePath)

        // Verifica se é uma migration de criação... se for, simplesmente gera todo o seu conteúdo novamente
        // Caso contrário, verifica se é uma migration de alteração... se for, gera apenas o conteúdo de alteração e faz um 
        // append no final do Schema::table

        if(table.latestMigrationCreatedTable()) {
            // Obtém o conteúdo do template
            const templateContent = await window.api.readTemplateFile('CreationMigration.vemtl')

            // Roda o template com os dados da tabela
            TemplateCompiler
                .setContent(templateContent)
                .setData({table})

            const compiledTemplate = TemplateCompiler.compile()

            // Retorna o conteúdo gerado
            console.log(compiledTemplate)

            return compiledTemplate
        } 
        
        // Obtém o conteúdo do template apenas dos campos alterados
        const templateContent = 'migration de alteração'
        console.log(templateContent)

        // Roda o template com os dados da tabela

        // Retorna o conteúdo gerado

        // Obtém o conteúdo do Schema::table

        // Faz um append do conteúdo gerado no final do Schema::table

        // Retorna o conteúdo gerado
        
        
        return latestMigrationContent
    }
</script>

<template>
    <div
        class="absolute bottom-0 left-0 p-4"
        v-if="projectStore.project.hasChangedTables()"
    >
        <UiButton class="flex items-center justify-between" @click="showingModal = true">
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Save
        </UiButton>

        <UiModal title="Review Migrations" :show="showingModal" @close="showingModal = false">
            
            <section class="p-4 space-y-4">
                <div class="bg-slate-800 rounded-lg" v-for="table in tablesSettings" :key="table.id">
                    <header class="p-4">
                        Table <span class="text-red-500 dark:text-red-400">{{ table.name }}</span>
                    </header>

                    <div class="p-4 space-y-4">
                        <div v-if="table.canUpdateLatestMigration">
                            <input class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2" type="radio" value="update" v-model="table.selectedOption" />
                            <label>Update latest migration 
                                <span 
                                    :title="table.latestMigration.relativePath"
                                    class="text-green-500 py-1 px-2 ml-0.5 bg-slate-900 rounded"
                                >{{ table.latestMigration.migrationName }}</span>
                            </label>
                        </div>

                        <div v-if="table.canCreateNewMigration">
                            <input class="rounded-full bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300 mr-2" type="radio" value="create" v-model="table.selectedOption" />
                            <label>Create new migration</label>
                        </div>
                    </div>
                </div>
            </section>

            <template #footer>
                <div class="flex justify-end p-4">
                    <UiButton
                        @click="saveMigrations"
                        >Save</UiButton
                    >
                </div>
            </template>
        </UiModal>
    </div>
</template>
