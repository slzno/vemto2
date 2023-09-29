<script setup lang="ts">
    import 'animate.css'
    import { onMounted, watch } from "vue"
    import SchemaTable from "../SchemaTable/SchemaTable.vue"
    import TableOptions from "../TableOptions/TableOptions.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const projectStore = useProjectStore(),
        schemaStore = useSchemaStore()

    let positionTracking: any = { top: 0, left: 0, x: 0, y: 0 }

    watch(() => schemaStore.focusedTable, table => {
        if(!table) return

        centerOnTable(table)
    })

    onMounted(() => {
        centerScrollIfNecessary()

        const tablesCanvas = document.getElementById("tablesCanvas")

        if (!tablesCanvas) return

        // set scroll from project scrollX and scrollY
        tablesCanvas.scrollLeft = projectStore.project.scrollX
        tablesCanvas.scrollTop = projectStore.project.scrollY

        tablesCanvas.addEventListener('mousedown', mouseDownHandler)
    })

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

        highlightTable(table)
    }
    
    /**
     * Center the scroll on the given position
     * 
     * @param x 
     * @param y 
     */
    const centerOnPosition = (x, y) => {
        // Reference to the tableCanvas element
        const tableCanvas = document.getElementById('tablesCanvas');

        // Calculate half of tableCanvas' width and height
        const halfWidth: number = tableCanvas.offsetWidth / 2;
        const halfHeight: number = tableCanvas.offsetHeight / 2;

        // Calculate the center of tablesContainer
        const centerTablesContainerX: number = 25000
        const centerTablesContainerY: number = 25000

        const scrollLeft = (centerTablesContainerX + parseInt(x)) - halfWidth,
            scrollTop = (centerTablesContainerY + parseInt(y)) - halfHeight

        // // Adjust the scroll position to center the computed target position
        tableCanvas.scrollLeft = scrollLeft
        tableCanvas.scrollTop = scrollTop
    }

    const highlightTable = (table) => {
        const tableElement = document.getElementById(`table_${table.id}`)

        console.log('will highlight table', `table_${table.id}`)

        if(!tableElement) return

        tableElement.classList.add('animate__animated','animate__pulse', 'animate__faster')

        setTimeout(() => {
            console.log('will remove animation')
            tableElement.classList.remove('animate__animated','animate__pulse', 'animate__faster')
        }, 500)
    }

    const centerScrollIfNecessary = () => {
        if(projectStore.project.hasScroll()) return

        const windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            sidebarNavWidth = 80,
            canvasWidth = windowWidth - sidebarNavWidth,
            canvasHeight = windowHeight


        projectStore.project.centerScroll(canvasWidth, canvasHeight)
    }

    const onScroll = (e: Event) => {
        const target = e.target as HTMLElement,
            tablesCanvas = document.getElementById("tablesCanvas"),
            tablesContainer = document.getElementById("tablesContainer")

        if (!tablesCanvas || !tablesContainer) return

        const scrollLeft = target.scrollLeft,
            scrollTop = target.scrollTop

        projectStore.project.saveScroll(scrollLeft, scrollTop)
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

        projectStore.project.saveScroll(element.scrollLeft, element.scrollTop)
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
                style="width: 1px; height: 1px;" 
                class="relative bg-transparent"
            >
                <SchemaTable
                    v-for="table in projectStore.project.tables"
                    :key="table.id"
                    :table="table"
                    @highlight="highlightTable(table)"
                />
            </div>
        </div>
    </div>
</template>
