<script setup lang="ts">
    import { nextTick, onMounted, onUnmounted, ref, watch } from "vue"
    import Project from "@Renderer/../common/models/Project"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import FormatMigrationsTables from "@Common/services/FormatMigrationsTables"
    import {
        newInstance,
        EVENT_DRAG_STOP,
        EVENT_DRAG_START,
        BrowserJsPlumbInstance,
    } from "@jsplumb/browser-ui"
    import { BezierConnector } from "@jsplumb/connector-bezier"

    const projectStore = useProjectStore()

    let project: Project = projectStore.project,
        tablesData = ref([]),
        tablesBaseData = ref([]),
        interval = 0,
        zoom = ref(1),
        isDragging = false,
        currentConnections = {},
        jsPlumbInstance: BrowserJsPlumbInstance = null,
        tablesPositions = {
            users: { top: 80, left: 30 },
            failed_jobs: { top: 100, left: 900 },
            password_resets: { top: 500, left: 900 },
            personal_access_tokens: { top: 400, left: 30 },
            posts: { top: 250, left: 400 },
        }

    onMounted(() => {
        window.api.loadSchema(project.path)

        interval = setInterval(() => {
            if (isDragging) return
            window.api.loadSchema(project.path)
        }, 500)

        window.api.onSchemaLoaded((data) => (tablesBaseData.value = data))
    })

    onUnmounted(() => {
        window.api.offSchemaLoaded()
        if (interval) clearInterval(interval)
    })

    watch(tablesBaseData, (data) => {
        if (isDragging) return

        let formatter = new FormatMigrationsTables(data)

        tablesData.value = formatter.get()

        nextTick(() => {
            initSchema()
        })
    })

    const initSchema = () => {
        if (!jsPlumbInstance) {
            jsPlumbInstance = newInstance({
                container: document.getElementById("tablesContainer")!,
                // elementsDraggable: true,
            })
        }

        tablesData.value.forEach((table: any) => {
            let node = document.getElementById("table_" + table.name)!

            jsPlumbInstance.manage(node)

            jsPlumbInstance.bind(EVENT_DRAG_START, () => {
                isDragging = true
            })

            jsPlumbInstance.bind(EVENT_DRAG_STOP, (p: any) => {
                isDragging = false

                let tableName = p.el.getAttribute("data-table-name")

                tablesPositions[tableName] = {
                    top: p.el.style.top.replace("px", ""),
                    left: p.el.style.left.replace("px", ""),
                }
            })

            if (table.hasRelatedTables()) {
                let relatedTables = table.relatedTables

                relatedTables.forEach((relatedTable: any) => {
                    let relatedNode = document.getElementById(
                            "table_" + relatedTable.name
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

    const getTablePosition = (tableName: string) => {
        if (tablesPositions[tableName]) {
            return tablesPositions[tableName]
        }

        return {
            top: Math.floor(Math.random() * 500),
            left: Math.floor(Math.random() * 500),
        }
    }

    const zoomIn = () => {
        zoom.value += 0.1
        document.getElementById("tablesContainer")!.style.transform =
            "scale(" + zoom.value + ")"
        jsPlumbInstance.setZoom(zoom.value)
    }

    const zoomOut = () => {
        zoom.value -= 0.1
        document.getElementById("tablesContainer")!.style.transform =
            "scale(" + zoom.value + ")"
        jsPlumbInstance.setZoom(zoom.value)
    }
</script>

<template>
    <div
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative text-slate-700 overflow-hidden"
    >
        <!-- <div class="absolute top-0 right-0 p-4 z-20">
            
        </div> -->

        <div class="absolute flex top-0 left-0 p-4 space-x-2 text-sm z-20">
            <div
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow px-1"
            >
                <!-- Tools and Icons -->
                <div class="flex">
                    <div
                        class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    >
                        <svg
                            class="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                    </div>

                    <!-- <div class="p-2 cursor-pointer text-slate-600 hover:text-red-500">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </div> -->

                    <div
                        class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    >
                        <svg
                            class="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                        </svg>
                    </div>
                </div>

                <!-- Search -->
                <div class="flex items-center mr-1 ml-8">
                    <input
                        type="text"
                        class="bg-slate-100 dark:bg-slate-950 px-4 py-1 rounded-full"
                        placeholder="Search"
                    />
                </div>
            </div>

            <div
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow"
            >
                <div
                    class="px-5 cursor-pointer text-red-500 hover:text-red-500"
                >
                    Main
                </div>
            </div>

            <div
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow"
            >
                <div
                    class="py-1 px-5 cursor-pointer text-slate-400 hover:text-red-500 flex items-center justify-center"
                >
                    New Schema
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                    </svg>
                </div>
            </div>
        </div>

        <div class="absolute bottom-0 left-0 py-1 px-1 w-full z-20">
            <div class="flex items-center justify-center">
                <div
                    class="flex italic text-sm text-slate-500 hover:text-slate-900 cursor-help"
                >
                    Showing {{ tablesData.length }} of
                    {{ tablesData.length }} tables
                </div>
            </div>
        </div>

        <div class="absolute bottom-0 right-0 p-4 z-20">
            <div
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow p-1"
            >
                <!-- Tools and Icons -->
                <div class="flex">
                    <div
                        class="p-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-red-500"
                        @click="zoomIn"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            ></path>
                        </svg>
                    </div>

                    <div
                        class="p-2 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-red-500"
                        @click="zoomOut"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                            ></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Entities -->
        <div
            id="tablesContainer"
            class="relative block w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-300 dark:scrollbar-thumb-black dark:scrollbar-track-slate-900"
        >
            <div
                :id="`table_${table.name}`"
                :ref="`table_${table.name}`"
                :data-table-name="table.name"
                class="schema-table cursor-move absolute shadow-lg p-4 rounded-lg bg-white dark:bg-slate-850 z-10"
                style="min-width: 270px"
                :style="{
                    top: getTablePosition(table.name).top + 'px',
                    left: getTablePosition(table.name).left + 'px',
                }"
                v-for="table in tablesData"
                :key="table.name"
            >
                <span
                    class="title w-full font-bold text-lg dark:text-slate-300"
                    >{{ table.name }}</span
                >

                <div class="mt-4 font-mono">
                    <div
                        class="w-full flex items-center text-slate-700 dark:text-slate-400"
                        v-for="column in table.columns"
                        :key="column.name"
                    >
                        <span
                            :class="{
                                'text-yellow-500 dark:text-yellow-400 font-semibold':
                                    column.autoIncrement,
                                'text-red-500 dark:text-red-400 font-semibold':
                                    column.isForeign(),
                                'text-orange-500 dark:text-orange-400 font-semibold':
                                    column.isUnique(),
                            }"
                            class="flex-grow pr-8 flex items-center"
                        >
                            <div
                                :class="{
                                    'bg-slate-200 dark:bg-slate-700':
                                        !column.autoIncrement,
                                    'bg-yellow-400 dark:bg-yellow-400':
                                        column.autoIncrement,
                                    'bg-red-500 dark:bg-red-400':
                                        column.isForeign(),
                                    'bg-orange-500 dark:bg-orange-400':
                                        column.isUnique(),
                                }"
                                class="w-2 h-2 mr-2 rounded-full"
                            ></div>
                            {{ column.name }}
                        </span>
                        <span
                            class="text-xs text-slate-400 display:none flex items-center"
                            >{{ column.type }}
                            <span
                                class="ml-1 text-slate-300"
                                v-if="column.hasOwnProperty('length')"
                                >({{ column.length }})</span
                            ></span
                        >
                        <span
                            :class="{
                                'text-red-400': column.nullable,
                                'text-slate-200 dark:text-slate-700':
                                    !column.nullable,
                            }"
                            class="cursor-pointer hover:text-red-500 font-bold pl-3"
                            >N</span
                        >
                    </div>
                </div>
            </div>

            <!-- <div
                id="table1"
                class="absolute w-32 h-32 bg-white shadow p-8"
                style="top: 20px; left: 20px"
            >
                Test 1
            </div>

            <div
                id="table2"
                class="absolute w-32 h-32 bg-white shadow p-8"
                style="top: 20px; left: 500px"
            >
                Test 1
            </div> -->
        </div>
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
