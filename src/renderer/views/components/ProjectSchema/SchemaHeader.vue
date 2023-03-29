<script setup lang="ts">
    import { ref } from 'vue'
    import Table from "@Common/models/Table"
    import { ArrowPathIcon } from "@heroicons/vue/24/outline"
    import UiModal from '@Renderer/components/ui/UiModal.vue'

    const showingCreateTableModal = ref(false)

    const createTable = (): void => {
        
    }

    const show = () => {
        showingCreateTableModal.value = true
    }

    const close = () => {
        showingCreateTableModal.value = false
    }
</script>

<template>
    <div class="absolute flex top-0 left-0 p-4 space-x-2 text-sm z-20">
        <div
            class="flex items-center bg-white dark:bg-slate-850 rounded-full shadow px-1"
        >
            <!-- Tools and Icons -->
            <div class="flex">
                <div
                    class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    @click="createTable()"
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

                <UiModal
                    title="Create Table"
                    :show="showingCreateTableModal"
                    @close="close()"
                >
                    Teste
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
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                    </svg>
                </div>

                <div
                    class="p-2 cursor-pointer text-slate-400 hover:text-red-500"
                    title="Force reload"
                >
                    <ArrowPathIcon
                        class="w-7 h-7"
                        @click="$emit('forceReload')"
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
</template>
