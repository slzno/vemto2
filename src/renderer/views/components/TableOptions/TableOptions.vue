<script setup lang="ts">
    import { toRef, ref } from "vue"
    import Table from "@Common/models/Table"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import TableModels from "../TableOptions/TableModels.vue"
    import TableColumns from "../TableOptions/TableColumns.vue"

    import {
        XMarkIcon,
    } from "@heroicons/vue/24/outline"
import UiButton from "@Renderer/components/ui/UiButton.vue"

    const props = defineProps({
        show: Boolean,
        table: Table,
    })

    const show = toRef(props, "show"),
        table = toRef(props, "table")

    const selectedTab = ref("columns")

    const tabs = [
        {label: "Columns", value: "columns"},
        {label: "Models", value: "models"},
        {label: "Indexes", value: "indexes"},
        {label: "Settings", value: "settings"},
    ]
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
                        <div class="text-red-400">{{ table.name }}</div>
                    </div>
                </div>

                <button
                    class="cursor-pointer flex absolute top-2 right-2"
                    @click="$emit('close')"
                >
                    <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                </button>

                <UiTabs :tabs="tabs" v-model="selectedTab" />

                <div class="p-4 space-y-2" v-if="selectedTab === 'columns'">
                    <TableColumns :table="table" />
                </div>

                <div class="p-4 space-y-2" v-if="selectedTab === 'models'">
                    <TableModels :table="table" />
                </div>

                <div class="p-4 space-y-2" v-if="selectedTab === 'indexes'">
                    <div class="text-red-400">Not implemented yet</div>
                </div>

                <div class="p-4 space-y-2" v-if="selectedTab === 'settings'">
                    <UiButton @click="table.logDataComparison()">Log data comparison</UiButton>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped></style>
