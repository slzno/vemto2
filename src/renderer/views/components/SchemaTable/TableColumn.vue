<script setup lang="ts">
    import { toRef } from "vue"

    const props = defineProps(["column"]),
        column = toRef(props, "column")
</script>

<template>
    <div class="w-full flex items-center text-slate-700 dark:text-slate-400">
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
                    'bg-slate-200 dark:bg-slate-700': !column.autoIncrement,
                    'bg-yellow-400 dark:bg-yellow-400': column.autoIncrement,
                    'bg-red-500 dark:bg-red-400': column.isForeign(),
                    'bg-orange-500 dark:bg-orange-400': column.isUnique(),
                }"
                class="w-2 h-2 mr-2 rounded-full"
            ></div>
            {{ column.name }}
        </span>
        <span class="text-xs text-slate-400 display:none flex items-center"
            >{{ column.type }}
            <span
                class="ml-1 text-slate-300"
                v-if="column.hasOwnProperty('length') && typeof column.length === 'number'"
                >({{ column.length }})</span
            ></span
        >
        <span
            :class="{
                'text-red-400': column.nullable,
                'text-slate-200 dark:text-slate-700': !column.nullable,
            }"
            class="cursor-pointer hover:text-red-500 font-bold pl-3"
            >N</span
        >
    </div>
</template>
