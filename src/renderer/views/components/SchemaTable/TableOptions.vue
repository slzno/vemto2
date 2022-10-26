<script setup lang="ts">
    import {
        XMarkIcon,
    } from "@heroicons/vue/24/outline"
    import Table from "@Common/models/Table"
    import { toRef } from "vue"
    import TableColumns from "../TableOptions/TableColumns.vue";

    const props = defineProps({
        show: Boolean,
        table: Table,
    })

    const show = toRef(props, "show"),
        table = toRef(props, "table")
</script>

<template>
    <!-- Transition animation from bottom to top -->
    <Transition
        enter-from-class="transition duration-200 translate-y-full"
        enter-to-class="transition duration-200 translate-y-0"
        leave-from-class="transition duration-200 translate-y-0"
        leave-to-class="transition duration-200 translate-y-full"
    >
        <div
            class="absolute right-0 top-0 h-full pt-10 px-4 z-50 text-slate-200"
            style="width: 38rem"
            v-if="show"
        >
            <div
                class="relative rounded-t-lg bg-slate-850 w-full h-full shadow-2xl border-t border-l border-r border-slate-600"
            >
                <div class="flex justify-between bg-slate-800 p-4 rounded-t-lg">
                    <div class="flex flex-col">
                        <span class="font-semibold">Table Options</span>
                        <small class="text-red-400">{{ table.name }}</small>
                    </div>
                </div>

                <button
                    class="cursor-pointer flex absolute top-2 right-2"
                    @click="$emit('close')"
                >
                    <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                </button>

                <ul
                    class="bg-slate-800 flex space-x-2 text-sm text-slate-500 px-1 border-b border-slate-700"
                >
                    <li
                        class="rounded-t px-2 py-1 -mb-px cursor-pointer text-slate-200 bg-slate-850 border-l border-t border-r border-slate-700"
                    >
                        Columns
                    </li>
                    <li
                        class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-200"
                    >
                        Models
                    </li>
                    <li
                        class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-200"
                    >
                        Indexes
                    </li>
                    <li
                        class="rounded-t px-2 py-1 -mb-px cursor-pointer hover:text-slate-200"
                    >
                        Settings
                    </li>
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

                <div class="p-4 space-y-2">
                    <TableColumns :columns="table.columns" />
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped></style>
