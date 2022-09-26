<script setup lang="ts">
    import { onMounted, ref } from "vue"
    import Project from "@Renderer/../common/models/Project"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const projectStore = useProjectStore()

    let project: Project = projectStore.project,
        tables: any = ref([])

    onMounted(() => {
        console.log(project)

        window.api.loadSchema(project.path)

        window.api.onSchemaLoaded((data) => {
            tables.value = data
        })
    })
</script>

<template>
    <div
        id="tablesContainer"
        class="bg-slate-100 w-full h-full relative rounded-r-xl text-slate-700"
    >
        <div class="absolute top-0 right-0 p-4">
            <div class="flex items-center bg-white rounded-full shadow px-1">
                <!-- Tools and Icons -->
                <div class="flex">
                    <div
                        class="p-2 cursor-pointer text-slate-600 hover:text-red-500"
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
                        class="p-2 cursor-pointer text-slate-600 hover:text-red-500"
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
                        class="bg-slate-100 px-4 py-1 rounded-full"
                        placeholder="Search"
                    />
                </div>
            </div>
        </div>

        <div class="absolute flex top-0 left-0 p-4 space-x-2 text-sm">
            <div class="flex items-center bg-white rounded-full shadow">
                <div
                    class="px-5 cursor-pointer text-red-500 hover:text-red-500"
                >
                    Main
                </div>
            </div>

            <div class="flex items-center bg-white rounded-full shadow">
                <div
                    class="px-5 cursor-pointer text-slate-500 hover:text-red-500"
                >
                    Inventory
                </div>
            </div>

            <!-- <div class="flex items-center bg-white rounded-full shadow">
                                <div class="px-5 cursor-pointer text-slate-500 hover:text-red-500">
                                    Sales
                                </div>
                            </div> -->

            <div class="flex items-center bg-white rounded-full shadow">
                <div
                    class="py-1 px-5 cursor-pointer text-slate-500 hover:text-red-500 flex items-center justify-center"
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

        <div class="absolute bottom-0 left-0 py-1 px-1 w-full">
            <div class="flex items-center justify-center">
                <div
                    class="flex italic text-sm text-slate-500 hover:text-slate-900 cursor-help"
                >
                    Showing 4 of 15 tables
                </div>
            </div>
        </div>

        <div class="absolute bottom-0 right-0 p-4">
            <div class="flex items-center bg-white rounded-full shadow p-1">
                <!-- Tools and Icons -->
                <div class="flex">
                    <div
                        class="p-2 cursor-pointer text-slate-600 hover:text-red-500"
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
                        class="p-2 cursor-pointer text-slate-600 hover:text-red-500"
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
            id="table1"
            class="table cursor-move absolute shadow-lg p-4 rounded-lg bg-white"
            style="min-width: 270px;"
            :style="{
                top: Math.floor(Math.random() * 1000) + 1 + 'px',
                left: Math.floor(Math.random() * 800) + 1 + 'px',
            }"
            v-for="table in tables"
            :key="table.name"
        >
            <span class="title w-full font-bold text-lg">{{ table.name }}</span>

            <div class="mt-4 font-mono">

                <div class="w-full flex items-center" 
                    v-for="column in table.columns" 
                    :key="column.name"
                >
                    <span
                        class="flex-grow pr-8 flex items-center text-slate-900"
                    >
                        <div
                            :class="{
                                'bg-yellow-400': column.autoIncrement,
                                'bg-slate-300': !column.autoIncrement,
                            }"
                            class="w-2 h-2 mr-2 rounded-full bg-yellow-400"
                        ></div>
                        {{ column.name }}
                    </span>
                    <span
                        class="text-xs text-slate-400 display:none flex items-center"
                        >{{ column.type }}</span
                    >
                    <span
                        :class="{'text-red-300': column.nullable, 'text-slate-200': !column.nullable}"
                        class="hover:text-red-500 font-bold pl-3"
                        >N</span
                    >
                </div>
                
            </div>
        </div>
    </div>
</template>

<style scoped></style>
