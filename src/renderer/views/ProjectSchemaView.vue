<script setup lang="ts">
    import Table from "@Common/models/Table"
    import { nextTick, onMounted, watch, ref } from "vue"
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

    const projectStore = useProjectStore()

    let isDragging = false,
        currentConnections = {},
        currentNodes = {},
        canDrawTables = ref(false),
        jsPlumbInstance: BrowserJsPlumbInstance = null

    onMounted(async () => {
        setTimeout(() => {
            canDrawTables.value = true

            nextTick(() => {
                drawConnections()
            })
        }, 1);
    })

    watch(() => projectStore.project.tables, () => {
        nextTick(() => drawConnections())
    })

    watch(() => projectStore.project.currentZoom, () => {
        if(!jsPlumbInstance) return

        jsPlumbInstance.setZoom(
            projectStore.project.getZoomAsScale()
        )
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
        if(projectStore.projectIsEmpty) return

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

        jsPlumbInstance.setZoom(
            projectStore.project.getZoomAsScale()
        )
    }
</script>

<template>
    <div
        style="width: 100%; height: 100%; max-width: calc(100vw - 80px); max-height: 100vh;"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
        v-if="projectStore.projectIsReady"
    >
        <SchemaHeader 
            @tableAdded="tableAdded"
            @syncSchema="syncSchema" 
        />

        <SchemaTables v-if="canDrawTables" />

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