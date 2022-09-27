<script setup lang="ts">
    import { nextTick, onMounted, onUnmounted, ref, watch } from "vue"
    import Project from "@Renderer/../common/models/Project"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import FormatMigrationsTables from "@Common/services/FormatMigrationsTables"
    import { newInstance } from "@jsplumb/browser-ui"
    import { BezierConnector } from "@jsplumb/connector-bezier"

    const projectStore = useProjectStore()

    let project: Project = projectStore.project,
        tablesData: any = ref([]),
        tablesBaseData: any = ref([])

    onMounted(() => {
        window.api.loadSchema(project.path)
        window.api.onSchemaLoaded((data) => (tablesBaseData.value = data))
    })

    onUnmounted(() => {
        window.api.offSchemaLoaded()
    })

    watch(tablesBaseData, (data) => {
        let formatter = new FormatMigrationsTables(data)

        tablesData.value = formatter.get()

        nextTick(() => {
            initSchema()
        })
    })

    const initSchema = () => {
        let instance = newInstance({
            container: document.getElementById("tablesContainer")!,
            // elementsDraggable: true,
        })

        instance.connect({
            source: document.getElementById("table1")!,
            target: document.getElementById("table2")!,
            anchor: "Continuous",
            cssClass: "connector",
            connector: BezierConnector.type,
        })

        // tablesData.value.forEach((table: any) => {
        //     let node = document.getElementById('table_' + table.name)

        //     if(table.hasRelatedTables()) {
        //         let relatedTables = table.relatedTables

        //         relatedTables.forEach((relatedTable: any) => {
        //             let relatedNode = document.getElementById('table_' + relatedTable.name)

        //             instance.connect({
        //                 source: node!,
        //                 target: relatedNode!,
        //                 anchor:"Continuous",
        //                 // anchors: ["Right", "Left"],
        //                 cssClass: 'connector',
        //                 connector: BezierConnector.type,
        //             })
        //         })

        //     }
        // })
    }
</script>

<template>
    <div
        class="bg-slate-100 w-full h-full relative rounded-r-xl text-slate-700 overflow-hidden"
    >
        <!-- Entities -->
        <div
            id="tablesContainer"
            class="relative block w-full h-full overflow-hidden"
        >
            <!-- <div
                :id="`table_${table.name}`"
                :ref="`table_${table.name}`"
                class="schema-table cursor-move absolute shadow-lg p-4 rounded-lg bg-white"
                style="min-width: 270px;"
                :style="{
                    top: Math.floor(Math.random() * 1000) + 1 + 'px',
                    left: Math.floor(Math.random() * 1000) + 1 + 'px',
                }"
                v-for="table in tablesData"
                :key="table.name"
            >
                <span class="title w-full font-bold text-lg">{{ table.name }}</span>
    
                <div class="mt-4 font-mono">
    
                    <div class="w-full flex items-center" 
                        v-for="column in table.columns" 
                        :key="column.name"
                    >
                        <span
                            :class="{
                            'text-yellow-500 font-semibold': column.autoIncrement,
                                'text-red-500 font-semibold': column.isUnique() || column.isForeign(),
                            }"
                            class="flex-grow pr-8 flex items-center"
                        >
                            <div
                                :class="{
                                    'bg-yellow-400': column.autoIncrement,
                                    'bg-slate-200': !column.autoIncrement,
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
                            :class="{'text-red-400': column.nullable, 'text-slate-200': !column.nullable}"
                            class="cursor-pointer hover:text-red-500 font-bold pl-3"
                            >N</span
                        >
                    </div>
                    
                </div>
            </div> -->

            <div
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
            </div>
        </div>
    </div>
</template>

<style scoped>
    .jtk-drag-select * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
</style>
