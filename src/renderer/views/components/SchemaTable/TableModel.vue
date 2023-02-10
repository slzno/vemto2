<script setup lang="ts">
    import { toRef } from "vue"

    const props = defineProps(["model"]),
        model = toRef(props, "model")
</script>

<template>
    <div class="dark:text-slate-300 space-y-2">
        <div class="rounded bg-slate-50 dark:bg-slate-900 px-2 py-1">
            <span class="font-semibold text-sm">{{ model.name }}</span>

            <div class="px-2 my-1" v-for="relationship in model.ownRelationships" :key="relationship.id">
                <div class="w-full flex items-center">
                    <span
                        class="flex-grow pr-8 flex items-center text-slate-400"
                    >
                        <span class="font-semibold dark:font-normal text-red-500 dark:text-red-400 text-sm"
                            >{{ relationship.type }}:</span
                        >
                        <span
                            class="font-normal ml-1 text-slate-700 dark:text-slate-300 text-sm"
                            >{{ relationship.name }}</span
                        >
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>