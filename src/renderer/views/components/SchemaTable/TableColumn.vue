<script setup lang="ts">
    import Column from "@Common/models/Column";
    import { toRef, Ref, computed } from "vue"

    const props = defineProps(["column"]),
        column = toRef(props, "column") as Ref<Column>

    const columnClasses = computed(() => {
        return {
            'line-through opacity-50': column.value.isRemoved(),
            'border-2 border-transparent': column.value.isValid(),
            'border-2 border-red-500 rounded': column.value.isInvalid()
        }
    })

    const columnNameClasses = computed(() => {
        return {
            'text-yellow-500 dark:text-yellow-400 font-semibold':
                column.value.isPrimaryKey(),
            'text-red-500 dark:text-red-400 font-semibold':
                column.value.isForeign(),
            'text-orange-500 dark:text-orange-400 font-semibold':
                column.value.isUnique(),
            'text-blue-400 dark:text-blue-300 font-semibold':
                column.value.isNotForeignIndex(),
        }
    })

    const sphereClasses = computed(() => {
        return {
            'bg-slate-200 dark:bg-slate-700': column.value.isNotPrimaryKey(),
            'bg-yellow-400 dark:bg-yellow-400': column.value.isPrimaryKey(),
            'bg-red-500 dark:bg-red-400': column.value.isForeign(),
            'bg-orange-500 dark:bg-orange-400': column.value.isUnique(),
            'bg-blue-400 dark:bg-blue-300': column.value.isNotForeignIndex(),
        }
    })
</script>

<template>
    <div :class="columnClasses" class="w-full flex items-center text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 px-1 rounded cursor-default py-[0.05rem]">
        <span
            :class="columnNameClasses"
            class="flex-grow pr-8 flex items-center"
        >
            <div
                :class="sphereClasses"
                class="w-2 h-2 mr-2 rounded-full"
            ></div>
            <span class="pr-6">{{ column.name }}</span>
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
            title="Unsigned"
            :class="{
                'font-thin text-slate-450 dark:text-slate-500': column.unsigned,
                'invisible': !column.unsigned,
            }"
            class="pl-4"
            >U</span
        >
        <span
            :title="column.nullable ? 'Nullable' : 'Not Nullable'"
            :class="{
                'text-red-400': column.nullable,
                'text-slate-200 dark:text-slate-700': !column.nullable,
            }"
            class="font-bold pl-2"
            >N</span
        >
    </div>
</template>
