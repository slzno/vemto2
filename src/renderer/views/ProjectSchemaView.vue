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
    
    watch(() => schemaStore.needsToReloadSchemaConnections, () => {
        console.log('needs to reload schema connections')
        drawConnectionsOnNextTick()
        schemaStore.schemaConnectionsAlreadyReloaded()
    })

    watch(() => schemaStore.needsToHideSchemaConnections, () => {
        console.log('needs to hide schema connections')
        
        if(jsPlumbInstance) {
            nextTick(() => {
                jsPlumbInstance.deleteEveryConnection()
                schemaStore.schemaConnectionsAlreadyHidden()
            })
        }
    })
    
    // Update the watcher to use schema section zoom
    watch(() => schemaStore.selectedSchemaSection?.zoom, () => changeSchemaZoom())
    
    watch(() => schemaStore.selectedSchemaSection, () => {

        if(jsPlumbInstance) {
            jsPlumbInstance.reset()
        }
        
        // Apply the correct zoom when schema section changes
        nextTick(() => {
            console.log('SCHEMA section changed')
            changeSchemaZoom()
        })

    })

    const zoomWithMouseWheel = () => {
        document.getElementById('tablesCanvas').addEventListener('mousewheel', (e: any) => { 
            e.preventDefault()
            e.stopPropagation()

            const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
            
            const tablesCanvas = document.getElementById('tablesCanvas')
            
            // Get mouse position relative to the canvas
            const rect = tablesCanvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            
            // Get current scroll position
            const scrollLeft = tablesCanvas.scrollLeft
            const scrollTop = tablesCanvas.scrollTop
            
            // Calculate mouse position relative to tablesContainer center (where tablesReference is positioned)
            const containerCenterX = 25000 // Center of tablesContainer
            const containerCenterY = 25000 // Center of tablesContainer
            
            // Position in the virtual space (accounting for current scroll)
            const posX = scrollLeft + mouseX - containerCenterX
            const posY = scrollTop + mouseY - containerCenterY
            
            // Get current zoom before changing it
            const currentZoom = schemaStore.selectedSchemaSection.getZoomAsScale()
            
            // Apply zoom using the schema section's methods
            if (delta > 0) {
                schemaStore.selectedSchemaSection.zoomIn()
            } else {
                schemaStore.selectedSchemaSection.zoomOut()
            }
            
            // Get new zoom after the change
            const newZoom = schemaStore.selectedSchemaSection.getZoomAsScale()
            
            // Wait for the zoom to be applied in the DOM
            nextTick(() => {
                // Calculate how the position changes with the new zoom
                const scaleFactor = newZoom / currentZoom
                
                // Calculate new scroll position to keep the point under cursor
                const newScrollLeft = containerCenterX + (posX * scaleFactor) - mouseX
                const newScrollTop = containerCenterY + (posY * scaleFactor) - mouseY
                
                // Apply new scroll
                tablesCanvas.scrollLeft = newScrollLeft
                tablesCanvas.scrollTop = newScrollTop
                
                // Save scroll position in the schema section
                schemaStore.selectedSchemaSection.saveScroll(newScrollLeft, newScrollTop)
            })
        }, { passive: false })
    }

    const checkForChanges = async () => {
        if (projectStore.projectIsEmpty) return

        const schemaBuilder = new SchemaBuilder(projectStore.project)

        await schemaBuilder.checkSchemaChanges()
    }

    const syncSchema = async (syncTables: boolean, syncModels: boolean) => {
        await loadSchema(syncTables, syncModels)

        schemaStore.askToReloadSchema()
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
            console.log('deleting every connection')
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

        const zoom = schemaStore.selectedSchemaSection.getZoomAsScale()

        console.log('changing schema zoom', zoom)
        
        // Apply zoom to jsPlumb instance
        jsPlumbInstance.setZoom(zoom)
        
        // Update the transform on the tablesReference element
        const tablesReference = document.getElementById('tablesReference')
        if (tablesReference) {
            tablesReference.style.transform = `scale(${zoom})`
        }
    }

    const reloadTables = () => {
        schemaStore.askToReloadSchema()
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