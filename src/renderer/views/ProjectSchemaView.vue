<script setup lang="ts">
    import Table from "@Common/models/Table"
    import { nextTick, onMounted, onUnmounted, ref } from "vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import modelsBuilder from "@Common/services/ModelsFromSchemaBuilder"
    import tablesBuilder from "@Common/services/TablesFromMigrationsBuilder"
    import SchemaTables from "@Renderer/views/components/ProjectSchema/SchemaTables.vue"

    import {
        newInstance,
        EVENT_DRAG_STOP,
        EVENT_DRAG_START,
        BrowserJsPlumbInstance,
    } from "@jsplumb/browser-ui"

    import { BezierConnector } from "@jsplumb/connector-bezier"
    import SchemaHeader from "./components/ProjectSchema/SchemaHeader.vue"
    import MigrationSaver from "./components/MigrationSaver/MigrationSaver.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
import UiButton from "@Renderer/components/ui/UiButton.vue"

    const projectStore = useProjectStore()

    let interval = null,
        isDragging = false,
        currentConnections = {},
        currentNodes = {},
        jsPlumbInstance: BrowserJsPlumbInstance = null

    onMounted(async () => {
        nextTick(() => {
            initSchema()
        })

        interval = setInterval(() => {
            if (isDragging) return
            loadSchema()
        }, 3000)
    })

    onUnmounted(() => {
        if (interval) clearInterval(interval)
    })

    const forceReload = async () => {
        const force = true
        await loadSchema(force)
    }

    const tableAdded = async (table: Table) => {
        console.log(table)

        nextTick(() => {
            setTimeout(() => {
                initSchema()
            }, 300)
        })
        
    }

    const loadSchema = async (force = false) => {
        if (isDragging) return
        if (projectStore.projectIsEmpty) return

        const schemaData = await Main.API.loadSchema(
            projectStore.project.path
        )

        const changedTables = await loadTables(schemaData, force),
            changedModels = await loadModels(schemaData, force)

        if(!changedTables && !changedModels) return

        nextTick(() => {
            initSchema()
        })
    }

    const loadTables = async (schemaData: any, force = false) => {
        if (!schemaData) return

        await tablesBuilder
            .setProject(projectStore.project)
            .setSchemaData(schemaData)
            .checkSchemaChanges()

        if(force) tablesBuilder.force()

        if (tablesBuilder.doesNotHaveSchemaChanges()) return false

        await tablesBuilder.build()

        if(force) projectStore.project.clearChangedTables()

        return true
    }

    const loadModels = async (schemaData: any, force = false) => {
        if (!schemaData) return

        await modelsBuilder
            .setProject(projectStore.project)
            .setSchemaData(schemaData)
            .checkSchemaChanges()

        if(force) modelsBuilder.force()

        if (modelsBuilder.doesNotHaveSchemaChanges()) return false

        await modelsBuilder.build()

        return true
    }

    const initSchema = () => {
        initJsPlumbIfNotExists()

        projectStore.project.tables.forEach((table: any) => {
            if(!table || !table.id) return

            if(!currentNodes[table.id]) {
                currentNodes[table.id] = document.getElementById("table_" + table.id)!

                jsPlumbInstance.manage(currentNodes[table.id])
            }
            
            let node = currentNodes[table.id]

            if (table.hasRelatedTables()) {
                let relatedTables = table.getRelatedTables()

                relatedTables.forEach((relatedTable: any) => {
                    if(!relatedTable || !relatedTable.id) return

                    let relatedNode = document.getElementById(
                            "table_" + relatedTable.id
                        ),
                        connectionName = table.name + "_" + relatedTable.name,
                        connectionNameReverse =
                            relatedTable.name + "_" + table.name

                    if (relatedNode && !currentConnections[connectionName]) {
                        jsPlumbInstance.connect({
                            source: node!,
                            target: relatedNode!,
                            anchor: "Continuous",
                            // anchors: ["Right", "Left"],
                            cssClass: "connector",
                            connector: BezierConnector.type,
                        })

                        currentConnections[connectionName] = true
                        currentConnections[connectionNameReverse] = true
                    }
                })
            }
        })
    }

    const initJsPlumbIfNotExists = () => {
        if (jsPlumbInstance) return

        jsPlumbInstance = newInstance({
            container: document.getElementById("tablesReference")!,
        })

        jsPlumbInstance.bind(EVENT_DRAG_START, () => {
            isDragging = true
        })

        jsPlumbInstance.bind(EVENT_DRAG_STOP, (p: any) => {
            isDragging = false

            const tableId = parseInt(p.el.getAttribute("data-table-id")).toString(),
                table: Table = projectStore.project.findTableById(tableId)

            table.positionX = p.el.style.left.replace("px", "")
            table.positionY = p.el.style.top.replace("px", "")
            table.save()
        })
    }
</script>

<template>
    <div
        style="width: 100%; height: 100%; max-width: calc(100vw - 80px); max-height: 100vh;"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
        v-if="projectStore.projectIsReady"
    >
        <UiModal
            :show="projectStore.project.hasCurrentSchemaError()"
            title="Error loading schema"
            width="800px"
            @close="projectStore.project.clearCurrentSchemaError()"
        >
            <div class="p-4 text-red-400 bg-slate-900 rounded-b-lg space-y-2">
                <pre class="overflow-hidden whitespace-pre-wrap">{{ projectStore.project.currentSchemaError }}</pre>

                <div v-if="projectStore.project.currentSchemaErrorStack">
                    <pre class="overflow-hidden whitespace-pre-wrap p-2 bg-slate-950 rounded-lg text-slate-200">{{ projectStore.project.currentSchemaErrorStack }}</pre>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end p-2">
                    <UiButton @click="projectStore.project.clearCurrentSchemaError()">Already Fixed</UiButton>
                </div>
            </template>
        </UiModal>

        <SchemaHeader 
            @tableAdded="tableAdded"
            @forceReload="forceReload" 
        />

        <SchemaTables />

        <MigrationSaver />

        <!-- <SchemaFooter /> -->
    </div>
</template>

<style>
    .jtk-drag-select * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    svg.connector path {
        stroke: #9ca3af;
        stroke-width: 2;
        z-index: 1;
    }

    svg.jtk-endpoint circle {
        fill: #9ca3af;
        z-index: 1;
    }

    .dark svg.connector path {
        stroke: #334155;
    }

    .dark svg.jtk-endpoint circle {
        fill: #334155;
    }
</style>
