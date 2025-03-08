<script setup lang="ts">
    import { ref, onMounted, nextTick, defineEmits, computed } from 'vue'
    import Table from "@Common/models/Table"
    import SchemaSection from "@Common/models/SchemaSection"
    import { ArrowDownTrayIcon, ArrowPathIcon, ChatBubbleLeftEllipsisIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, PhotoIcon, PlusCircleIcon, PlusIcon, RectangleGroupIcon, ViewfinderCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline"
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
    import UiLoading from '@Renderer/components/ui/UiLoading.vue'
    import UiOptionsDropdown from '@Renderer/components/ui/UiOptionsDropdown.vue'
    import UiDropdownItem from '@Renderer/components/ui/UiDropdownItem.vue'
import ReservedKeywords from '@Common/models/services/ReservedKeywords'

    const showingCreateTableModal = ref(false),
        showingCreateSectionModal = ref(false),
        projectStore = useProjectStore(),
        schemaStore = useSchemaStore(),
        newTable = ref<Table>(null),
        newSection = ref<SchemaSection>(null),
        addModelForNewTable = ref(true),
        confirmDialog = ref(null),
        search = ref(''),
        searchInput = ref(null),
        searchIsFocused = ref(false)

    const props = defineProps({
        'loadingSchema': {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits([
        'tableAdded', 
        'syncSchema', 
        'checkForChanges',
        'scrollChanged',
    ])

    const filteredTables = computed(() => {
        return projectStore.project.tables.filter(table => {
            return table.name.toLowerCase().includes(search.value.toLowerCase())
        }).sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
    })

    onMounted(() => {
        reset()

        addModelForNewTable.value = true
    })

    const closeSearch = () => {
        searchInput.value.blur()

        setTimeout(() => {
            searchIsFocused.value = false
            search.value = ''
        }, 150);
    }

    const focusTable = (table: Table) => {
        closeSearch()

        selectSchemaSection(table.section)

        setTimeout(() => {
            schemaStore.focusTable(table)
        }, 150)
    }

    const createTable = (): void => {
        validateTable().then(isValid => {
            if(!isValid) return

            newTable.value.saveFromInterface(
                addModelForNewTable.value
            )

            updateTablePosition(newTable.value)

            closeTableModal()

            emit('tableAdded', newTable.value)

            setTimeout(() => {
                highlightTable(newTable.value)
            }, 350)
        })
    }

    const validateTable = async (): Promise<boolean> => {
        const reservedKeywordsChecker = new ReservedKeywords()

        if(reservedKeywordsChecker.isReserved(newTable.value.name)) {
            Alert.error('This table name is a reserved PHP keyword')
            return false
        }

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

    const createSection = (): void => {
        validateSection().then(isValid => {
            if(!isValid) return

            newSection.value.save()

            closeSectionModal()

            setTimeout(() => {
                highlightTable(newSection.value)
            }, 350)
        })
    }

    const validateSection = async (): Promise<boolean> => {
        const rules = {
            name: 'required|string'
        }

        const validator = new Validator(newSection.value, rules),
            hasErrors = await validator.fails()

        if(hasErrors) {
            Alert.error('Please enter a valid section name')
            return false
        }

        const sectionNameExists = projectStore.project.hasSection(newSection.value.name)

        if(sectionNameExists) {
            Alert.error('This section name is already in use')
            return false
        }

        return !sectionNameExists && !hasErrors
    }

    const highlightTable = (table) => {
        const tableElement = document.getElementById(`table_${table.id}`)

        if(!tableElement) return

        tableElement.classList.add('animate__animated','animate__pulse', 'animate__faster')

        setTimeout(() => {
            tableElement.classList.remove('animate__animated','animate__pulse', 'animate__faster')
        }, 500)
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

    const showTableModal = (): void => {
        const currentTablesCount = projectStore.project.tables.length

        if(!window.licenseIsActive() && currentTablesCount > 15) {
            window.showLicenseModal("This project has more than 15 tables (including Laravel default tables). Please activate your license to add unlimited tables.")
            return
        }

        reset()
        
        showingCreateTableModal.value = true

        nextTick(() => {
            document.getElementById('new-table-name')?.focus()
        })
    }

    const closeTableModal = (): void => {
        showingCreateTableModal.value = false
    }

    const showSectionModal = (): void => {
        reset()
        showingCreateSectionModal.value = true

        nextTick(() => {
            document.getElementById('new-section-name')?.focus()
        })
    }

    const closeSectionModal = (): void => {
        showingCreateSectionModal.value = false
    }

    const reset = (): void => {
        newTable.value = new Table({
            projectId: projectStore.project.id,
            sectionId: schemaStore.selectedSchemaSection.id,
        })

        newSection.value = new SchemaSection({
            projectId: projectStore.project.id,
        })
    }

    const checkForChanges = () => {
        emit('checkForChanges')
    }

    const syncSchema = async () => {
        schemaStore.deselectTable()
        
        const confirmed = await confirmDialog.value.confirm()
        if(!confirmed) return

        emit('syncSchema', confirmed.syncTables, confirmed.syncModels)
    }

    const dismissChangesAlert = () => {
        projectStore.project.canShowSchemaSourceChangesAlert = false
        projectStore.project.save()
    }

    const info = (message: string) => {
        Alert.info(message)
    }

    const zoomIn = async () => {
        projectStore.project.zoomIn()
    }

    const zoomOut = async () => {
        projectStore.project.zoomOut()
    }

    const newSchema = async () => {
        showSectionModal()
    }

    const selectSchemaSection = (section: SchemaSection) => {
        if(schemaStore.selectedSchemaSectionIs(section)) return

        schemaStore.selectSchemaSection(section)
    }

    const removeSection = async (section: SchemaSection) => {
        const confirmed = await window.projectConfirm(
            `Are you sure you want to delete <span class="text-red-500">${section.name}</span>?`,
            "Delete Schema Section",
            {
                infoMessage: "All tables in this schema section will be moved to the default section."
            }
        )

        if(!confirmed) return
        
        try {
            section.checkAndDelete()
            
            nextTick(() => {
                schemaStore.selectDefaultSchemaSection()
            })
        } catch (error: any) {
            Alert.error(error.message)
        }
    }

    const centerScroll = () => {
        if(!schemaStore.selectedSchemaSection) return

        schemaStore.selectedSchemaSection.requestScrollCentering()
    }

    const repaintSchema = () => {
        schemaStore.askToReloadSchema()
    }

    const organizeTables = () => {
        schemaStore.organizeTables()
    }

    const organizeTablesHorizontally = () => {
        schemaStore.organizeTablesHorizontally()
    }
</script>

<template>
    <UiConfirm ref="confirmDialog" title="Synchronize Schema" :options="{
        'syncTables': {
            'label': 'Sync Tables',
            'value': true
        },
        'syncModels': {
            'label': 'Sync Models',
            'value': true
        },
    }">
        Are you sure you want to synchronize the schema with the source code? 
        <UiWarning class="mt-2" v-show="projectStore.project.hasSchemaChanges()">
            <b>You have unsaved changes in the schema that will be lost.</b> This includes tables and models not synced with the application source code.
        </UiWarning>
    </UiConfirm>

    <Transition
        enter-from-class="transition duration-300 opacity-0"
        enter-to-class="transition duration-300 opacity-100"
        leave-from-class="transition duration-300 opacity-100"
        leave-to-class="transition duration-300 opacity-0"
    >
        <div class="absolute flex top-16 left-0 p-2 px-3 space-x-2 text-sm z-20 bg-slate-900 rounded-r-lg" v-show="projectStore.project.canShowSchemaSourceChangesAlert">
            <div class="flex items-center bg-white dark:bg-slate-850 rounded-lg shadow border border-slate-100 dark:border-slate-700 p-2.5 space-x-4">
                <div>
                    <div>There are changes in the code</div>
                </div>
                <div class="flex space-x-1">
                    <UiButton class="space-x-1" @click="syncSchema()">
                        <ArrowPathIcon class="w-4 h-4 text-green-500"/> 
                        <div>Sync</div>
                    </UiButton>
                    <UiButton class="space-x-1" @click="dismissChangesAlert()">
                        <XMarkIcon class="w-4 h-4 text-red-500"/>
                        <div>Dismiss</div>
                    </UiButton>
                </div>
            </div>
        </div>
    </Transition>

    <div class="absolute flex top-0 left-0 p-3 space-x-2 text-sm z-20 bg-slate-100 dark:bg-slate-900 w-full">
        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow px-1 border border-slate-100 dark:border-slate-700"
        >
            <!-- Tools and Icons -->
            <div class="flex">
                <button
                    title="Add table (CTRL + Shift + T)"
                    class="p-2 cursor-pointer text-slate-600 dark:text-slate-350 hover:text-red-500 dark:hover:text-red-500 border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none rounded"
                    @click="showTableModal()"
                    v-shortkey="['ctrl', 'shift', 't']" @shortkey="showTableModal()"
                >
                    <PlusCircleIcon class="w-7 h-7 stroke-1" />
                </button>

                <!-- New table modal -->
                <UiModal
                    width="450px"
                    title="Create Table"
                    :show="showingCreateTableModal"
                    @close="closeTableModal()"
                >
                    <div class="p-4">
                        <div class="m-1 flex flex-col gap-2" @keyup.enter="createTable()">
                            <UiText v-model="newTable.name" id="new-table-name" placeholder="Table Name"></UiText>
                            <UiCheckbox class="mt-2" v-model="addModelForNewTable" label="Add a default model"></UiCheckbox>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex justify-end p-2">
                            <UiButton @click="createTable()">Create</UiButton>
                        </div>
                    </template>
                </UiModal>

                <!-- New section/schema modal -->
                <UiModal
                    width="25%"
                    title="Create Schema Section"
                    :show="showingCreateSectionModal"
                    @close="closeSectionModal()"
                >
                    <div class="p-4">
                        <div class="m-1 flex flex-col gap-2" @keyup.enter="createTable()">
                            <UiText v-model="newSection.name" id="new-section-name" placeholder="Schema Section Name"></UiText>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex justify-end p-2">
                            <UiButton @click="createSection()">Create</UiButton>
                        </div>
                    </template>
                </UiModal>

                <button
                    @click="info('Schema Comments: Coming soon...')"
                    title="Add comment"
                    class="p-2 cursor-pointer text-slate-600 dark:text-slate-350 hover:text-red-500 dark:hover:text-red-500 border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none"
                >
                    <svg
                        class="w-7 h-7 stroke-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <ChatBubbleLeftEllipsisIcon class="w-7 h-7 stroke-1" />
                    </svg>
                </button>

                <button
                    class="p-2 cursor-pointer text-slate-600 dark:text-slate-350 hover:text-red-500 dark:hover:text-red-500 border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none rounded"
                    title="Sync Schema"
                    @click="syncSchema()"
                >
                    <div class="w-7 h-7 flex items-center justify-center" v-if="loadingSchema">
                        <UiLoading :stroke-width="2"></UiLoading>
                    </div>
                    <div v-else>
                        <ArrowPathIcon
                            class="w-7 h-7 stroke-1"
                        />
                    </div>
                </button>

                <div class="flex items-center text-slate-300 text-base">
                    <UiOptionsDropdown icon-size="w-6 h-6" size="w-72" right-side>
                        <UiDropdownItem @click="checkForChanges()">
                            <ArrowPathIcon class="w-5 h-5 mr-3 text-red-450" />
                            Check for Changes
                        </UiDropdownItem>
    
                        <UiDropdownItem @click="info('Save as Image: Coming soon...')">
                            <PhotoIcon class="w-5 h-5 mr-3 text-red-450" />
                            Save as Image
                        </UiDropdownItem>

                        <UiDropdownItem @click="centerScroll()">
                            <ViewfinderCircleIcon class="w-5 h-5 mr-3 text-red-450" />
                            Centralize View
                        </UiDropdownItem>

                        <UiDropdownItem @click="repaintSchema()">
                            <ArrowPathIcon class="w-5 h-5 mr-3 text-red-450" />
                            Repaint Schema
                        </UiDropdownItem>

                        <UiDropdownItem @click="organizeTables()">
                            <RectangleGroupIcon class="w-5 h-5 mr-3 text-red-450" />
                            Organize Tables
                        </UiDropdownItem>

                        <UiDropdownItem @click="organizeTablesHorizontally()">
                            <RectangleGroupIcon class="w-5 h-5 mr-3 text-red-450" />
                            Organize Tables Horiz.
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
            </div>

            <!-- Control -->
            <div class="flex items-center ml-4 border-r border-l border-slate-200 dark:border-slate-750">
                <button
                    class="p-2 cursor-pointer text-slate-500 dark:text-slate-350 hover:text-red-500 dark:hover:text-red-500 border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none rounded"
                    title="Zoom In"
                    @click="zoomIn()"
                >
                    <MagnifyingGlassPlusIcon
                        class="w-5 h-5"
                    />
                </button>
                <div class="text-xs text-slate-500 w-5 text-center select-none">
                    {{ projectStore.project.currentZoom || 100 }}
                </div>
                <button
                    class="p-2 cursor-pointer text-slate-500 dark:text-slate-350 hover:text-red-500 dark:hover:text-red-500 border border-transparent focus:border-red-500 dark:focus:border-red-500 outline-none rounded"
                    title="Zoom Out"
                    @click="zoomOut()"
                >
                    <MagnifyingGlassMinusIcon
                        class="w-5 h-5"
                    />
                </button>
            </div>

            <!-- Search -->
            <div class="relative flex items-center mr-1 ml-4">
                <input
                    ref="searchInput"
                    v-model="search"
                    @focus="searchIsFocused = true"
                    @blur="closeSearch()"
                    @keyup.esc="closeSearch()"
                    type="text"
                    class="bg-slate-100 dark:bg-slate-950 px-4 py-1 rounded-full focus:border-red-500 dark:focus:border-red-500 border border-slate-300 dark:border-slate-750 focus:ring-transparent placeholder-slate-400 dark:placeholder-slate-500 placeholder:font-thin"
                    placeholder="Search..."
                />

                <div 
                    v-show="searchIsFocused"
                    class="absolute p-4 rounded-lg shadow border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 w-72 max-h-96 overflow-y-auto z-50"
                    style="top: 110%; left: 0;"
                >
                    <div @click="focusTable(table)" class="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 rounded px-2 py-1" v-for="table in filteredTables" :key="table.id">
                        {{ table.name }}
                    </div>
                </div>
            </div>
        </div>

        <div class="flex gap-1 items-center text-xs">
            <button
                @click="newSchema()"
                class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow border border-slate-100 dark:border-slate-700 h-6 focus:border-red-500 dark:focus:border-red-500 outline-none"
            >
                <div
                    class="py-1 px-5 cursor-pointer text-slate-600 dark:text-slate-350 hover:text-red-500 dark:hover:text-red-500 flex items-center justify-center"
                >
                    <PlusIcon class="w-4 h-4 mr-1" />
                    New Schema
                </div>
            </button>

            
            <div v-for="section in projectStore.project.schemaSections">
                <button
                    @click="selectSchemaSection(section)"
                    :class="{
                        'border-red-450 dark:border-red-450': schemaStore.selectedSchemaSectionIs(section),
                        'border-slate-100 dark:border-slate-700': !schemaStore.selectedSchemaSectionIs(section),
                    }"
                    class="flex relative group items-center bg-white dark:bg-slate-850 rounded-full shadow border h-6 focus:border-red-500 dark:focus:border-red-500 outline-none"
                >
                    <div
                        :class="{
                            'text-red-450 dark:text-red-450': schemaStore.selectedSchemaSectionIs(section),
                            'text-slate-600 dark:text-slate-350': !schemaStore.selectedSchemaSectionIs(section),
                        }"
                        class="px-5 cursor-pointer hover:text-red-600 dark:hover:text-red-500 select-none"
                    >
                        {{ section.name }}
                    </div>

                    <div @click.prevent.stop="removeSection(section)" class="absolute right-0 invisible group-hover:visible px-1">
                        <XMarkIcon
                            class="w-3.5 h-3.5 text-slate-600 dark:text-slate-500 cursor-pointer hover:text-red-400 dark:hover:text-red-500"
                        />
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
