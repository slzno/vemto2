<script setup lang="ts">
    import { ref, onMounted, nextTick, defineEmits } from 'vue'
    import Table from "@Common/models/Table"
    import { ArrowDownTrayIcon, ArrowPathIcon, PhotoIcon, PlusCircleIcon } from "@heroicons/vue/24/outline"
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import Validator from '@Common/util/Validator'
    import Alert from '@Renderer/components/utils/Alert'
    import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue'
    import UiConfirm from '@Renderer/components/ui/UiConfirm.vue'
    import UiWarning from '@Renderer/components/ui/UiWarning.vue'

    const showingCreateTableModal = ref(false),
        projectStore = useProjectStore(),
        newTable = ref<Table>(null),
        addModelForNewTable = ref(true),
        confirmDialog = ref(null)

    const emit = defineEmits(['tableAdded', 'forceReload'])

    const createTable = (): void => {
        validate().then(isValid => {
            if(!isValid) return

            newTable.value.saveFromInterface(
                addModelForNewTable.value
            )

            close()

            emit('tableAdded')
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
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow px-1"
        >
            <!-- Tools and Icons -->
            <div class="flex">
                <div
                    class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    @click="show()"
                >
                    <PlusCircleIcon class="w-7 h-7" />
                </div>

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
                >
                    <ArrowDownTrayIcon
                        class="w-7 h-7"
                        @click="forceReload()"
                    />
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

        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow"
        >
            <div
                class="px-5 cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
            >
                App
            </div>
        </div>

        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow"
        >
            <div
                class="px-5 cursor-pointer text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
            >
                Laravel
            </div>
        </div>
    </div>
</template>
