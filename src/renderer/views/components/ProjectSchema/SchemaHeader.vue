<script setup lang="ts">
    import { ref, onMounted, nextTick, defineEmits, computed } from 'vue'
    import Table from "@Common/models/Table"
    import { ArrowDownTrayIcon, ArrowPathIcon, PhotoIcon, PlusCircleIcon, PlusIcon } from "@heroicons/vue/24/outline"
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import Validator from '@Common/util/Validator'
    import Alert from '@Renderer/components/utils/Alert'
    import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue'
    import UiConfirm from '@Renderer/components/ui/UiConfirm.vue'
    import UiWarning from '@Renderer/components/ui/UiWarning.vue'
    import { useSchemaStore } from '@Renderer/stores/useSchemaStore'

    const showingCreateTableModal = ref(false),
        projectStore = useProjectStore(),
        schemaStore = useSchemaStore(),
        newTable = ref<Table>(null),
        addModelForNewTable = ref(true),
        confirmDialog = ref(null),
        search = ref(''),
        searchInput = ref(null),
        searchIsFocused = ref(false)

    const emit = defineEmits(['tableAdded', 'forceReload'])

    const filteredTables = computed(() => {
        return projectStore.project.tables.filter(table => {
            return table.name.toLowerCase().includes(search.value.toLowerCase())
        }).sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
    })

    const closeSearch = () => {
        searchInput.value.blur()

        setTimeout(() => {
            searchIsFocused.value = false
            search.value = ''
        }, 150);
    }

    const focusTable = (table: Table) => {
        console.log('focus table')
        closeSearch()
        // projectStore.focusTable(table)
    }

    const createTable = (): void => {
        validate().then(isValid => {
            if(!isValid) return

            newTable.value.saveFromInterface(
                addModelForNewTable.value
            )

            updateTablePosition(newTable.value)

            close()

            emit('tableAdded', newTable.value)
        })
    }

    const validate = async (): Promise<boolean> => {
        const rules = {
            name: 'required|string'
        }

        const validator = new Validator(newTable.value, rules),
            hasErrors = await validator.fails()

        if(hasErrors) {
            Alert.error('Please enter a valid table name')
            return false
        }

        const tableNameExists = projectStore.project.hasTable(newTable.value.name)

        if(tableNameExists) {
            Alert.error('This table name is already in use')
            return false
        }

        return !tableNameExists && !hasErrors
    }

    const updateTablePosition = (table: Table): void => {
        const canvasCenter = getCurrentCanvasCenter(),
            defaultTableWidth = 274,
            defaultTableHeight = 198

        // Calculate table offsets from table width and height
        const offsetLeft = defaultTableWidth / 2,
            offsetTop = defaultTableHeight / 2

        // Calculate the new position of the table
        const positionX = canvasCenter.x - offsetLeft,
            positionY = canvasCenter.y - offsetTop

        // Update the table position
        table.positionX = positionX
        table.positionY = positionY

        table.save()
    }

    const getCurrentCanvasCenter = () => {
        const tableCanvas = document.getElementById('tablesCanvas');
        const tablesContainer = document.getElementById('tablesContainer');

        // Get the current scroll position of tableCanvas
        const scrollLeft = tableCanvas.scrollLeft;
        const scrollTop = tableCanvas.scrollTop;

        // Calculate half of tableCanvas' width and height
        const halfWidth = tableCanvas.offsetWidth / 2;
        const halfHeight = tableCanvas.offsetHeight / 2;

        // Calculate the center position relative to tablesContainer
        const centerX = scrollLeft + halfWidth - (tablesContainer.offsetWidth / 2);
        const centerY = scrollTop + halfHeight - (tablesContainer.offsetHeight / 2);

        return { x: centerX, y: centerY };
    }

    const show = (): void => {
        clear()
        showingCreateTableModal.value = true

        nextTick(() => {
            document.getElementById('new-table-name')?.focus()
        })
    }

    const close = (): void => {
        showingCreateTableModal.value = false
    }

    const clear = (): void => {
        if(!newTable.value) return

        newTable.value.name = ''
    }

    onMounted(() => {
        newTable.value = new Table({
            projectId: projectStore.project.id,
        })

        addModelForNewTable.value = true
    })

    const forceReload = async () => {
        const confirmed = await confirmDialog.value.confirm()
        if(!confirmed) return

        emit('forceReload')
    }
</script>

<template>
    <UiConfirm ref="confirmDialog">
        Are you sure you want to force reload the schema? 
        
        <UiWarning class="mt-2">
            All unsaved changes will be lost. This includes models and tables not synced with the application source code.
        </UiWarning>
    </UiConfirm>

    <div class="absolute flex top-0 left-0 p-4 space-x-2 text-sm z-20">

        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow px-1 border border-slate-700"
        >
            <!-- Tools and Icons -->
            <div class="flex">
                <div
                    class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    @click="show()"
                >
                    <PlusCircleIcon class="w-7 h-7" />
                </div>

                <!-- New table modal -->
                <UiModal
                    width="25%"
                    title="Create Table"
                    :show="showingCreateTableModal"
                    @close="close()"
                >
                    <div class="m-2">
                        <div class="m-1 flex flex-col gap-2" @keyup.enter="createTable()">
                            <UiText v-model="newTable.name" id="new-table-name" placeholder="Table Name"></UiText>
                            <UiCheckbox v-model="addModelForNewTable" label="Add a default model"></UiCheckbox>
                        </div>
                        <div class="m-1 mt-2 flex justify-end">
                            <UiButton @click="createTable()">Create</UiButton>
                        </div>
                    </div>
                </UiModal>

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
                        <PhotoIcon class="w-7 h-7" />
                    </svg>
                </div>

                <div
                    class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    title="Sync Schema"
                >
                    <ArrowPathIcon
                        class="w-7 h-7"
                    />
                </div>

                <div
                    class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    title="Force reload (needs confirmation)"
                    @click="forceReload()"
                >
                    <ArrowDownTrayIcon
                        class="w-7 h-7"
                    />
                </div>
            </div>

            <!-- Search -->
            <div class="relative flex items-center mr-1 ml-8">
                <input
                    ref="searchInput"
                    v-model="search"
                    @focus="searchIsFocused = true"
                    @blur="closeSearch()"
                    @keyup.esc="closeSearch()"
                    type="text"
                    class="bg-slate-100 dark:bg-slate-950 px-4 py-1 rounded-full focus:border-red-500 border border-transparent focus:ring-transparent"
                    placeholder="Search"
                />

                <div 
                    v-show="searchIsFocused"
                    class="absolute p-4 rounded-lg shadow border border-slate-700 bg-slate-800 w-72"
                    style="top: 110%; left: 0;"
                >
                    <div @click="focusTable(table)" class="cursor-pointer hover:bg-slate-700 rounded px-2 py-1" v-for="table in filteredTables" :key="table.id">
                        {{ table.name }}
                    </div>
                </div>
            </div>
        </div>

        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow border border-slate-700"
        >
            <div
                class="py-1 px-5 cursor-pointer text-slate-400 hover:text-red-500 flex items-center justify-center"
            >
                <PlusIcon class="w-4 h-4 mr-1" />
                New Schema
            </div>
        </div>

        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow border border-slate-700"
        >
            <div
                class="px-5 cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
            >
                App
            </div>
        </div>

        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow border border-slate-700"
        >
            <div
                class="px-5 cursor-pointer text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
            >
                Laravel
            </div>
        </div>
    </div>
</template>
