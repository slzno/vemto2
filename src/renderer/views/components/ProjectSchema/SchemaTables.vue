<script setup lang="ts">
    import 'animate.css'
    import { debounce } from 'lodash'
    import Table from '@Common/models/Table'
    import { onMounted, onUnmounted, watch, ref, Ref, defineEmits, nextTick } from "vue"
    import SchemaTable from "../SchemaTable/SchemaTable.vue"
    import TableOptions from "../TableOptions/TableOptions.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiLoading from '@Renderer/components/ui/UiLoading.vue'

    const projectStore = useProjectStore(),
        schemaStore = useSchemaStore(),
        tables = ref([]) as Ref<Table[]>,
        loading = ref(true),
        showLoading = ref(false),
        canLoadTables = ref(false)

    const emit = defineEmits(["tablesLoaded"])

    let positionTracking: any = { top: 0, left: 0, x: 0, y: 0 }

    watch(() => schemaStore.selectedTable, table => {
        if(!table.id) {
            clearHighlight()
            return
        }

        highlightTable(table)
    })

    watch(() => schemaStore.focusedTable, table => {
        if(!table) return

        centerOnTable(table)
    })

    watch(() => schemaStore.needsToReloadSchema, (needsReload) => {
        if(!needsReload) return

        console.log('needs to reload tables')

        loadTables()
    })

    watch(() => schemaStore.selectedSchemaSection, () => {
        centerScrollIfNecessary()
        setCanvasScroll()
        loadTables()
    })

    watch(() => schemaStore.selectedSchemaSection.scrollCenteringRequested, (value) => {
        if(value) {
            centerScroll()
            setCanvasScroll()
            schemaStore.selectedSchemaSection.clearScrollCenteringRequest()
        }
    })
    
    watch(() => schemaStore.needsToAnimateTablesPositions, (needsToAnimate) => {
        if(needsToAnimate) {
            animateTablesToNewPositions()
            schemaStore.tablesAnimationCompleted()
        }
    })

    let tablesCreatedListenerId = null,
        tablesDeletedListenerId = null

    onMounted(() => {
        canLoadTables.value = true

        centerScrollIfNecessary()

        const tablesCanvas = document.getElementById("tablesCanvas")

        if (!tablesCanvas) return

        setCanvasScroll()

        tablesCanvas.addEventListener('mousedown', mouseDownHandler)

        tablesCreatedListenerId = projectStore.project.addListener('tables:created', debounce(() => {
            console.log('table created from schema tables')
            loadTables()
        }, 100))

        tablesDeletedListenerId = projectStore.project.addListener('tables:deleted', debounce(() => {
            console.log('table deleted from schema tables')
            loadTables()
        }, 100))

        loadTables()
    })

    onUnmounted(() => {
        if(projectStore.projectIsEmpty) return
        
        projectStore.project.removeListener(tablesCreatedListenerId)
        projectStore.project.removeListener(tablesDeletedListenerId)
    })

    const loadTables = async (showLoadingIndicator: boolean = true) => {
        loading.value = true
        showLoading.value = showLoadingIndicator
    
        setTimeout(() => {
            if(!canLoadTables.value) return
    
            if(projectStore.projectIsEmpty) return
    
            tables.value = projectStore.project.getTablesBySection(schemaStore.selectedSchemaSection)
            
            loading.value = false
            showLoading.value = false

            schemaStore.schemaAlreadyReloaded()

            nextTick(() => {
                emit('tablesLoaded')
            })
        }, 100)
    }

    /**
     * Animate tables to their new positions
     */
    const animateTablesToNewPositions = async () => {
        const tables = schemaStore.selectedSchemaSection.tables

        if (tables.length === 0) return
        
        // hide all connections
        schemaStore.askToHideSchemaConnections()
        
        const tablesContainer = document.getElementById("tablesContainer")
        if (!tablesContainer) return
        
        // Calculate distance of each table from center
        const tablesWithDistance = tables.map(table => {
            const posX = table.positionX || 0
            const posY = table.positionY || 0
            
            const distance = Math.sqrt(
                Math.pow(posX, 2) + 
                Math.pow(posY, 2)
            )
            
            return { table, distance }
        })
        
        // Sort by distance (closest to center first)
        tablesWithDistance.sort((a, b) => a.distance - b.distance)
        
        // Animate each table to its position with a delay
        tablesWithDistance.forEach((item, index) => {
            const tableElement = document.getElementById(`table_${item.table.id}`)
            if (!tableElement) return
            
            // Get current position from the DOM
            const currentLeft = parseInt(tableElement.style.left || '0')
            const currentTop = parseInt(tableElement.style.top || '0')
            
            // New position from table data
            const newLeft = item.table.positionX || 0
            const newTop = item.table.positionY || 0
            
            // Reset any previous transition and animation
            tableElement.style.transition = 'none'
            
            // Only animate if positions changed
            if (currentLeft !== newLeft || currentTop !== newTop) {
                setTimeout(() => {
                    // Apply transition
                    tableElement.style.transition = 'left 0.5s, top 0.5s'
                    tableElement.style.left = `${newLeft}px`
                    tableElement.style.top = `${newTop}px`
                    
                    // Add a subtle pulse animation class
                    tableElement.classList.add('animate__animated', 'animate__pulse')
                    
                    // Remove animation classes after animation completes
                    setTimeout(() => {
                        tableElement.classList.remove('animate__animated', 'animate__pulse')
                    }, 600)
                }, index * 100) // Stagger the animations
            }
        })
        
        // After all animations complete, ensure the connections are redrawn
        const totalAnimationTime = (tablesWithDistance.length * 100) + 600
        
        setTimeout(() => {
            schemaStore.askToReloadSchemaConnections()
        }, totalAnimationTime)
    }

    /**
     * Center the scroll on the given table
     */
    const centerOnTable = (table) => {
        const tableElement = document.getElementById(`table_${table.id}`)

        if(!tableElement) return

        const tableElementWidth = tableElement.offsetWidth,
            tableElementHeight = tableElement.offsetHeight

        const positionX = parseInt(table.positionX) + (tableElementWidth / 2),
            positionY = parseInt(table.positionY) + (tableElementHeight / 2)

        centerOnPosition(positionX, positionY)

        focusTable(table)
    }
    
    /**
     * Center the scroll on the given position
     * 
     * @param x 
     * @param y 
     */
    const centerOnPosition = (x, y) => {
        // Reference to the tableCanvas element
        const tableCanvas = document.getElementById('tablesCanvas')

        // Calculate half of tableCanvas' width and height
        const halfWidth: number = tableCanvas.offsetWidth / 2
        const halfHeight: number = tableCanvas.offsetHeight / 2

        // Calculate the center of tablesContainer
        const centerTablesContainerX: number = 25000
        const centerTablesContainerY: number = 25000

        const scrollLeft = (centerTablesContainerX + parseInt(x)) - halfWidth,
            scrollTop = (centerTablesContainerY + parseInt(y)) - halfHeight

        // // Adjust the scroll position to center the computed target position
        tableCanvas.scrollLeft = scrollLeft
        tableCanvas.scrollTop = scrollTop
    }

    const focusTable = (table) => {
        const tableElement = document.getElementById(`table_${table.id}`)

        if(!tableElement) return

        tableElement.classList.add('animate__animated','animate__pulse', 'animate__faster')

        setTimeout(() => {
            tableElement.classList.remove('animate__animated','animate__pulse', 'animate__faster')
        }, 500)
    }

    const highlightTable = (table) => {
        // add opacity-30 to all other .schema-table tables
        const tables = document.querySelectorAll('.schema-table')

        tables.forEach((tableElement) => {
            if(tableElement.id === `table_${table.id}`) {
                tableElement.classList.remove('opacity-30')
            } else {
                tableElement.classList.add('opacity-30')
            }
        })
    }

    const clearHighlight = () => {
        const tables = document.querySelectorAll('.schema-table')

        tables.forEach((tableElement) => {
            tableElement.classList.remove('opacity-30')
        })
    }

    const centerScrollIfNecessary = () => {
        if(schemaStore.selectedSchemaSection.hasScroll()) return

        centerScroll()
    }

    const centerScroll = () => {
        const windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            sidebarNavWidth = 80,
            canvasWidth = windowWidth - sidebarNavWidth,
            canvasHeight = windowHeight

            schemaStore.selectedSchemaSection.centerScroll(canvasWidth, canvasHeight)
    }

    const setCanvasScroll = () => {
        const tablesCanvas = document.getElementById("tablesCanvas")

        tablesCanvas.scrollLeft = schemaStore.selectedSchemaSection.scrollX
        tablesCanvas.scrollTop = schemaStore.selectedSchemaSection.scrollY
    }

    const onScroll = (e: Event) => {
        const target = e.target as HTMLElement,
            tablesCanvas = document.getElementById("tablesCanvas"),
            tablesContainer = document.getElementById("tablesContainer")

        if (!tablesCanvas || !tablesContainer) return

        const scrollLeft = target.scrollLeft,
            scrollTop = target.scrollTop

        schemaStore.selectedSchemaSection.saveScroll(scrollLeft, scrollTop)
    }

    const mouseDownHandler = (e) => {
        let element = document.getElementById("tablesCanvas")

        element.style.cursor = 'grabbing'
        element.style.userSelect = 'none'

        positionTracking = {
            // The current scroll 
            left: element.scrollLeft,
            top: element.scrollTop,
            // Get the current mouse position
            x: e.clientX,
            y: e.clientY,
        }

        element.addEventListener('mousemove', mouseMoveHandler)
        element.addEventListener('mouseup', mouseUpHandler)
    }

    const mouseMoveHandler = (e) => {
        let element = document.getElementById("tablesCanvas")

        console.log()

        // How far the mouse has been moved
        const dx = e.clientX - positionTracking.x
        const dy = e.clientY - positionTracking.y

        // Scroll the element
        element.scrollTop = positionTracking.top - dy
        element.scrollLeft = positionTracking.left - dx

        schemaStore.selectedSchemaSection.saveScroll(element.scrollLeft, element.scrollTop)
    }

    const mouseUpHandler = () => {
        let element = document.getElementById("tablesCanvas")

        element.style.cursor = 'grab'
        element.style.removeProperty('user-select')

        element.removeEventListener('mousemove', mouseMoveHandler)
        element.removeEventListener('mouseup', mouseUpHandler)
    }
</script>

<template>
    <TableOptions 
        :show="schemaStore.hasSelectedTable"
    />

    <div
        id="tablesCanvas"
        style="width: 100%; height: 100%;"
        @scroll.passive="onScroll"
        class="relative block overflow-auto cursor-grab scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-300 dark:scrollbar-thumb-black dark:scrollbar-track-slate-900"
    >
        <div v-show="showLoading" class="fixed top-0 left-0 w-full h-full flex items-center justify-center space-x-2 z-50 opacity-20">
            <UiLoading></UiLoading> 
            <span>Loading...</span>
        </div>
        <div
            id="tablesContainer"
            class="flex justify-center items-center"
            style="width: 50000px; height: 50000px;"
        >
            <div id="tablesReference" 
                :style="`transform: scale(${projectStore.project.getZoomAsScale()})`"
                style="width: 1px; height: 1px;" 
                class="relative bg-transparent"
            >
                <SchemaTable
                    v-for="table in tables"
                    :key="table.id"
                    :table="table"
                />
            </div>
        </div>
    </div>
</template>
