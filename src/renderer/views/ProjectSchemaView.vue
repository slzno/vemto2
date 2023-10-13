<script setup lang="ts">
    import Table from "@Common/models/Table"
    import { nextTick, onMounted, watch } from "vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import SchemaBuilder from "@Renderer/services/schema/SchemaBuilder"
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
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"

    const projectStore = useProjectStore()

    let isDragging = false,
        currentConnections = {},
        currentNodes = {},
        jsPlumbInstance: BrowserJsPlumbInstance = null

    onMounted(async () => {
        nextTick(() => {
            drawConnections()
        })
    })

    watch(() => projectStore.project.tables, () => {
        nextTick(() => drawConnections())
    })

    const syncSchema = async (syncTables: boolean, syncModels: boolean) => {
        await loadSchema(syncTables, syncModels)
    }

    const tableAdded = async (table: Table) => {
        nextTick(() => {
            setTimeout(() => {
                drawConnections()
            }, 300)
        })
    }

    const loadSchema = async (syncTables: boolean, syncModels: boolean) => {
        if (isDragging) return
        if (projectStore.projectIsEmpty) return

        const schemaBuilder = new SchemaBuilder(projectStore.project)

        schemaBuilder.build(syncTables, syncModels)

        nextTick(() => drawConnections())
    }

    const drawConnections = () => {
        initJsPlumbIfNotExists()

        jsPlumbInstance.deleteEveryConnection()
        currentConnections = {}

        projectStore.project.tables.forEach((table: Table) => {
            if(!table || !table.id) return

            if(!currentNodes[table.id]) {
                currentNodes[table.id] = document.getElementById("table_" + table.id)!

                jsPlumbInstance.manage(currentNodes[table.id])
            }
            
            const node = currentNodes[table.id],
                relatedTablesRelations = table.getRelatedTablesRelations()

            // connect tables
            if (relatedTablesRelations.length > 0) {
                relatedTablesRelations.forEach((relation: any) => {
                    if(!relation.table || !relation.table.id) return

                    let relatedNode = document.getElementById(
                            "table_" + relation.table.id
                        ),
                        connectionName = table.name + "_" + relation.table.name,
                        connectionNameReverse =
                            relation.table.name + "_" + table.name

                    if (relatedNode && !currentConnections[connectionName]) {
                        const cssClass = relation.type === "relationship" ? "connector" : "connector dotted"

                        jsPlumbInstance.connect({
                            source: node!,
                            target: relatedNode!,
                            anchor: "Continuous",
                            // anchors: ["Right", "Left"],
                            cssClass: cssClass,
                            connector: {
                                type: BezierConnector.type,
                                options: {
                                    curviness: 100,
                                },
                            },
                            // paintStyle: { dashstyle: "4 4 4 4" },
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
            @syncSchema="syncSchema" 
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

    svg.dotted path {
        stroke-dasharray: 4 4 4 4;
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
@Renderer/services/schema/ModelsBuilder@Renderer/services/schema/TablesBuilder@Renderer/services/schema/ModelsBuilder