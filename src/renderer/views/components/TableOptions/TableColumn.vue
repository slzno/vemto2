<script setup lang="ts">
    import { Bars3Icon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    import Column from "@Renderer/../common/models/Column"
    import { PropType, toRef } from "vue"

    const props = defineProps({
        column: {
            type: Object as PropType<Column>,
            required: true,
        },
    })

    const column = toRef(props, "column")
</script>

<template>
    <div
        :class="{
            'border-yellow-400': column.autoIncrement,
            'border-red-400': column.isForeign(),
            'border-orange-400': column.isUnique(),
        }"
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div class="flex space-x-2 items-center">
            <div class="px-2">
                <Bars3Icon
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"
                />
            </div>

            <div class="flex flex-grow space-x-2">
                <div class="flex flex-col flex-grow">
                    <input
                        type="text"
                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                        placeholder="Name"
                        v-model="column.name"
                    />
                </div>

                <div class="flex flex-col w-36">
                    <select
                        class="border-0 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg"
                    >
                        <option calue="bigInteger">Big Integer</option>
                        <option calue="string">String</option>
                        <option calue="timestamp">Timestamp</option>
                    </select>
                </div>

                <div class="flex items-center justify-between">
                    <label class="flex items-center space-x-1">
                        <input
                            type="checkbox"
                            class="rounded bg-slate-950 border-0 text-red-500 shadow-sm focus:border-red-500 focus:ring focus:ring-offset-0 focus:ring-opacity-20 focus:ring-slate-300"
                            placeholder=""
                            value=""
                            v-model="column.nullable"
                        />
                        <span class="text-xs text-slate-400">Nullable</span>
                    </label>
                </div>
            </div>

            <div class="px-2">
                <ChevronDownIcon
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"
                />
            </div>
        </div>
    </div>
</template>
