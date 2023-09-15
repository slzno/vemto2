<script setup lang="ts">
    import { onMounted } from "vue"
    import SchemaTable from "../SchemaTable/SchemaTable.vue"
    import TableOptions from "../TableOptions/TableOptions.vue"
    import { useSchemaStore } from "@Renderer/stores/useSchemaStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const projectStore = useProjectStore(),
        schemaStore = useSchemaStore()

    let positionTracking: any = { top: 0, left: 0, x: 0, y: 0 }

    onMounted(() => {

        centerScrollIfNecessary()

        const tablesCanvas = document.getElementById("tablesCanvas")

        if (!tablesCanvas) return

        // set scroll from project scrollX and scrollY
        tablesCanvas.scrollLeft = projectStore.project.scrollX
        tablesCanvas.scrollTop = projectStore.project.scrollY

        tablesCanvas.addEventListener('mousedown', mouseDownHandler)
    })

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
                />
            </div>
        </div>
    </div>
</template>
