<script setup lang="ts">
    import 'animate.css'
    import { debounce } from 'lodash'
    import Table from '@Common/models/Table'
    import { onMounted, watch, ref, Ref, defineEmits, nextTick } from "vue"
    import SchemaTable from "../SchemaTable/SchemaTable.vue"
    import TableOptions from "../TableOptions/TableOptions.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const projectStore = useProjectStore(),
        schemaStore = useSchemaStore(),
        tables = ref([]) as Ref<Table[]>,
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

    onMounted(() => {
        canLoadTables.value = true

        centerScrollIfNecessary()

        const tablesCanvas = document.getElementById("tablesCanvas")

        if (!tablesCanvas) return

        setCanvasScroll()

        tablesCanvas.addEventListener('mousedown', mouseDownHandler)

        projectStore.project.addListener('tables:changed', debounce(() => {
            loadTables()
        }, 100))

        loadTables()
    })

    const loadTables = async () => {
        setTimeout(() => {
            if(!canLoadTables.value) return
    
            if(projectStore.projectIsEmpty) return
    
            tables.value = projectStore.project.getTablesBySection(schemaStore.selectedSchemaSection)
    
            nextTick(() => {
                emit('tablesLoaded')
            })
        }, 1)
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
