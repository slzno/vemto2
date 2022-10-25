<script setup lang="ts">
    import { nextTick, onMounted, onUnmounted, ref } from "vue"
    import Table from "@Common/models/Table"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import {
        newInstance,
        EVENT_DRAG_STOP,
        EVENT_DRAG_START,
        BrowserJsPlumbInstance,
    } from "@jsplumb/browser-ui"
    import { BezierConnector } from "@jsplumb/connector-bezier"
    import tablesBuilder from "@Common/services/TablesFromMigrationsBuilder"
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from "@heroicons/vue/24/outline"

    const projectStore = useProjectStore()

    let tablesData = ref([]),
        interval = 0,
        zoom = ref(1),
        isDragging = false,
        currentConnections = {},
        jsPlumbInstance: BrowserJsPlumbInstance = null

    onMounted(() => {
        setTimeout(() => {
            tablesData.value = Table.get()
            
            nextTick(() => {
                initSchema()
            })
        }, 300)

        interval = setInterval(() => {
            if (isDragging) return
            loadSchema()
        }, 500)
    })

    onUnmounted(() => {
        if (interval) clearInterval(interval)
    })

    const loadSchema = async () => {
        if (isDragging) return
        if(projectStore.projectIsEmpty) return

        const schemaData = await window.api.loadSchema(projectStore.project.path)

        if (!schemaData) return

        tablesBuilder
            .setProject(projectStore.project)
            .setSchemaData(schemaData)
            .checkSchemaChanges()

        if(tablesBuilder.doesNotHaveSchemaChanges()) return

        tablesBuilder.build()

        tablesData.value = Table.get()

        nextTick(() => {
            initSchema()
        })
    }

    const initSchema = () => {
        if (!jsPlumbInstance) {
            jsPlumbInstance = newInstance({
                container: document.getElementById("tablesContainer")!
            })
        }

        tablesData.value.forEach((table: any) => {
            let node = document.getElementById("table_" + table.id)!

            jsPlumbInstance.manage(node)

            jsPlumbInstance.bind(EVENT_DRAG_START, () => {
                isDragging = true
            })
            
            jsPlumbInstance.bind(EVENT_DRAG_STOP, (p: any) => {
                isDragging = false

                const tableId = parseInt(p.el.getAttribute("data-table-id")),
                    table: Table = tablesData.value.find((table) => table.id === tableId)

                table.positionX = p.el.style.left.replace("px", "")
                table.positionY = p.el.style.top.replace("px", "")
                table.save()
            })

            if (table.hasRelatedTables()) {
                let relatedTables = table.getRelatedTables()

                relatedTables.forEach((relatedTable: any) => {
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

    const getTablePosition = (table: Table) => {
        return {
            left: (table.positionX || 0) + 'px',
            top: (table.positionY || 0) + 'px',
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
        class="bg-slate-100 dark:bg-slate-900 w-full h-full relative overflow-hidden"
    >
        <!-- <div class="absolute top-0 right-0 p-4 z-20">
            
        </div> -->

        <div class="absolute right-0 top-0 h-full pt-10 px-4 z-50 text-slate-200" style="width: 38rem">
            <div class="relative rounded-t-lg bg-slate-850 w-full h-full shadow-2xl border-t border-l border-r border-slate-600">
                <div class="flex justify-between bg-slate-800 p-4 rounded-t-lg">
                    <div class="flex flex-col">
                        <span class="font-semibold">Table Options</span>
                        <small class="text-red-400">users</small>
                    </div>
                </div>

                <button class="cursor-pointer flex absolute top-2 right-2">
                    <XMarkIcon class="w-3 h-3 stroke-2" />
                </button>
                
                <ul class="bg-slate-800 flex space-x-2 text-xs text-slate-500 px-1 border-b border-slate-700">
                    <li class="rounded-t px-2 py-1 -mb-px cursor-pointer text-slate-200 bg-slate-850 border-l border-t border-r border-slate-700">Columns</li>
                    <li class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-200">Models</li>
                    <li class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-200">Indexes</li>
                    <li class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-200">Settings</li>
                </ul>

                <!-- <div class="p-4 space-y-4">
                    <div class="flex flex-col">
                        <label class="text-xs mb-1 text-slate-400">Name</label>
                        <input
                            type="text"
                            class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                            placeholder="Name"
                            value="users"
                        />
                    </div>

                    <div class="flex flex-col">
                        <label class="text-xs mb-1 text-slate-400">Item Noun</label>
                        <input
                            type="text"
                            class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                            placeholder="Name"
                            value="user"
                        />
                    </div>
                </div> -->
                
                <div class="p-2 space-y-2">

                    <div class="relative flex-col bg-slate-800 border-l-4 border-yellow-400 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="id"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">Uns. Big Int</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="name"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">String</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="nickname"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">String</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                            checked
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="email"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">String</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="email_verified_at"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">Timestamp</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                            checked
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-orange-500 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="password"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">String</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="created_at"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">Timestamp</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                            checked
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="updated_at"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">Timestamp</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                            checked
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="avatar"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">String</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                            checked
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>

                    <div class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow">
                        <div class="flex space-x-2 items-center">
                            <div class="px-2">
                                <Bars3Icon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"/>
                            </div>

                            <div class="flex flex-grow space-x-2">
                                <div class="flex flex-col flex-grow">
                                    <input
                                        type="text"
                                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                                        placeholder="Name"
                                        value="remember_token"
                                    />
                                </div>
        
                                <div class="flex flex-col w-36">
                                    <select class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                        <option value="">String</option>
                                    </select>
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="flex items-center space-x-1">
                                        <input
                                            type="checkbox"
                                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                                            placeholder=""
                                            value=""
                                            checked
                                        />
                                        <span class="text-xs text-slate-400">Nullable</span>
                                    </label>

                                </div>
                            </div>

                            <div class="px-2">
                                <ChevronDownIcon class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"/>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        </div>

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
                        class="border-0 bg-slate-100 dark:bg-slate-950 px-4 py-1 rounded-full"
                        placeholder="Search"
                    />
                </div>
            </div>

            <div
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow"
            >
                <div
                    class="px-5 cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
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
                :id="`table_${table.id}`"
                :ref="`table_${table.id}`"
                :data-table-id="table.id"
                :class="{'border border-slate-500': table.name === 'users'}"
                class="schema-table cursor-move absolute shadow-lg rounded-lg bg-white dark:bg-slate-850 z-10 space-y-4 pb-4"
                style="min-width: 270px"
                :style="{
                    top: getTablePosition(table).top,
                    left: getTablePosition(table).left,
                }"
                v-for="table in tablesData"
                :key="table.name"
            >
                <div class="w-full bg-slate-800 hover:bg-slate-700 rounded-t-lg px-4 pt-2 pb-2">
                    <span
                        class="title w-full font-bold text-lg dark:text-slate-300"
                        >{{ table.name }}</span
                    >
                </div>

                <div class="font-mono px-4">
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
                            >{{ column.typeDefinition }}
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

                
                <div class="font-mono px-4" v-if="table.name == 'users'">
                    
                    <!-- <div class="w-full border-t-2 border-slate-800 my-4"></div> -->
                    <!-- <h4 class="text-slate-400 text-sm font-semibold text-right">Models</h4> -->
                    
                    <div class="text-slate-300 space-y-2">
                        <div class="rounded bg-slate-900 px-2 py-1">
                            <span class="font-semibold text-sm">User.php</span>

                            <div class="px-2 my-1">
                                <div class="w-full flex items-center">
                                    <span class="flex-grow pr-8 flex items-center text-slate-400">
                                        <!-- <div class="w-2 h-2 mr-2 rounded-full bg-slate-700"></div> -->
                                        <span class="font-normal text-red-400 text-sm">hasMany:</span>
                                        <span class="font-normal ml-1 text-slate-300 text-sm">Post</span>
                                    </span>
                                    <!-- <span class="text-xs text-slate-500 display:none flex items-center">Rel</span> -->
                                </div>
                                <div class="w-full flex items-center">
                                    <span class="flex-grow pr-8 flex items-center text-slate-400">
                                        <!-- <div class="w-2 h-2 mr-2 rounded-full bg-slate-700"></div> -->
                                        <span class="font-normal text-red-400 text-sm">hasMany:</span>
                                        <span class="font-normal ml-1 text-slate-300 text-sm">Video</span>
                                    </span>
                                    <!-- <span class="text-xs text-slate-500 display:none flex items-center">Rel</span> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="font-mono px-4" v-if="table.name == 'posts'">
                    
                    <!-- <div class="w-full border-t-2 border-slate-800 my-4"></div> -->
                    <!-- <h4 class="text-slate-400 text-sm font-semibold text-right">Models</h4> -->
                    
                    <div class="text-slate-300 space-y-2">
                        <div class="rounded bg-slate-900 px-2 py-1">
                            <span class="font-semibold text-sm">Post.php</span>

                            <div class="px-2 my-1">
                                <div class="w-full flex items-center">
                                    <span class="flex-grow pr-8 flex items-center text-slate-400">
                                        <!-- <div class="w-2 h-2 mr-2 rounded-full bg-slate-700"></div> -->
                                        <span class="font-normal text-red-400 text-sm">belongsTo:</span>
                                        <span class="font-normal ml-1 text-slate-300 text-sm">User</span>
                                    </span>
                                    <!-- <span class="text-xs text-slate-500 display:none flex items-center">Rel</span> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="font-mono px-4" v-if="table.name == 'videos'">
                    
                    <!-- <div class="w-full border-t-2 border-slate-800 my-4"></div> -->
                    <!-- <h4 class="text-slate-400 text-sm font-semibold text-right">Models</h4> -->
                    
                    <div class="text-slate-300 space-y-2">
                        <div class="rounded bg-slate-900 px-2 py-1">
                            <span class="font-semibold text-sm">Video.php</span>

                            <div class="px-2 my-1">
                                <div class="w-full flex items-center">
                                    <span class="flex-grow pr-8 flex items-center text-slate-400">
                                        <!-- <div class="w-2 h-2 mr-2 rounded-full bg-slate-700"></div> -->
                                        <span class="font-normal text-red-400 text-sm">belongsTo:</span>
                                        <span class="font-normal ml-1 text-slate-300 text-sm">User</span>
                                    </span>
                                    <!-- <span class="text-xs text-slate-500 display:none flex items-center">Rel</span> -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
