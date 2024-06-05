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
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"

    const projectStore = useProjectStore(),
        schemaStore = useSchemaStore()

    let isDragging = false,
        currentConnections = {},
        currentNodes = {},
        canDrawTables = ref(false),
        loadingSchema = ref(false),
        jsPlumbInstance: BrowserJsPlumbInstance = null

    onMounted(async () => {
        setTimeout(() => {
            canDrawTables.value = true

            schemaStore.selectLatestSchemaSection()

            nextTick(() => {
                zoomWithMouseWheel()
            })
        }, 1)
    })

    watch(() => projectStore.project.currentZoom, () => changeSchemaZoom())
    watch(() => schemaStore.selectedSchemaSection, () => {

        if(jsPlumbInstance) {
            jsPlumbInstance.reset()
        }

    })

    const zoomWithMouseWheel = () => {
        document.getElementById('tablesCanvas').addEventListener('mousewheel', (e: any) => { 
            e.preventDefault()
            e.stopPropagation()

            const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))

            delta > 0 ? projectStore.project.zoomIn() : projectStore.project.zoomOut()
        }, { passive: false })
    }

    const checkForChanges = async () => {
        if (projectStore.projectIsEmpty) return

        const schemaBuilder = new SchemaBuilder(projectStore.project)

        await schemaBuilder.checkSchemaChanges()
    }

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

        loadingSchema.value = true

        await nextTick()

        const schemaBuilder = new SchemaBuilder(projectStore.project)

        await schemaBuilder.build(syncTables, syncModels)

        drawConnectionsOnNextTick()

        loadingSchema.value = false
    }

    const drawConnectionsOnNextTick = () => {
        nextTick(() => {
            drawConnections()
        })
    }

    const drawConnections = () => {
        if(projectStore.projectIsEmpty) return

        const jsplumbStarted = initJsPlumbIfNotExists()

        if (!jsplumbStarted) return

        currentNodes = {}
        currentConnections = {}

        jsPlumbInstance.batch(() => {
            jsPlumbInstance.deleteEveryConnection({
                force: true,
            })
    
            const tables = projectStore.project.getTablesBySection(schemaStore.selectedSchemaSection)
    
            tables.forEach((table: Table) => {
                if(!table || !table.id) return
    
                if(!currentNodes[table.id]) {
                    currentNodes[table.id] = document.getElementById("table_" + table.id)!
    
                    if(!currentNodes[table.id]) return
                    jsPlumbInstance.manage(currentNodes[table.id])
                }
                
                const node = currentNodes[table.id],
                    relatedTablesRelations = table.getRelatedTablesRelationsOnSection(
                        schemaStore.selectedSchemaSection
                    )
    
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
                                anchors: [["Right", "Left"], ["Left", "Right"]],
                                cssClass: cssClass,
                                connector: {
                                    type: BezierConnector.type,
                                    options: {
                                        curviness: 70,
                                    },
                                },
                            })
    
                            currentConnections[connectionName] = true
                            currentConnections[connectionNameReverse] = true
                        }
                    })
                }
            })
        })
    }

    const initJsPlumbIfNotExists = () => {
        if (jsPlumbInstance) return true

        const containerElement = document.getElementById("tablesReference")

        if (!containerElement) return false

        jsPlumbInstance = newInstance({
            container: document.getElementById("tablesReference")!
        })

        jsPlumbInstance.bind(EVENT_DRAG_STOP, (p: any) => {
            isDragging = false

            const tableId = parseInt(p.el.getAttribute("data-table-id")).toString(),
                table: Table = projectStore.project.findTableById(tableId)

            table.positionX = p.el.style.left.replace("px", "")
            table.positionY = p.el.style.top.replace("px", "")
            table.save()
        })

        changeSchemaZoom()

        return true
    }

    const changeSchemaZoom = () => {
        if (!jsPlumbInstance) return
        if (projectStore.projectIsEmpty) return

        jsPlumbInstance.setZoom(
            projectStore.project.getZoomAsScale()
        )
    }

    const reloadTables = () => {
        schemaStore.setNeedsReload()
    }
</script>

<template>
    <div
        style="width: 100%; height: 100%; max-width: calc(100vw - 80px); max-height: 100vh;"
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
        v-if="projectStore.projectIsReady"
    >
        <SchemaHeader 
            :loading-schema="loadingSchema"
            @tableAdded="tableAdded"
            @syncSchema="syncSchema" 
            @checkForChanges="checkForChanges"
        />

        <SchemaTables 
            v-if="canDrawTables" 
            @tablesLoaded="drawConnectionsOnNextTick()" 
        />

        <MigrationSaver @schemaSaved="reloadTables()" />
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
        stroke: #cbd5e1;
        stroke-width: 3;
        z-index: 1;
    }

    svg.dotted path {
        stroke-dasharray: 4 4 4 4;
    }

    svg.jtk-endpoint circle {
        fill: #cbd5e1;
        z-index: 1;
    }

    .dark svg.connector path {
        stroke: #334155;
    }

    .dark svg.jtk-endpoint circle {
        fill: #334155;
    }
</style>