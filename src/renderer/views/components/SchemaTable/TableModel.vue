<script setup lang="ts">
    import { DocumentTextIcon, ExclamationCircleIcon, ExclamationTriangleIcon, PencilSquareIcon, UserIcon } from "@heroicons/vue/24/outline";
    import { toRef } from "vue"

    const props = defineProps(["model"]),
        model = toRef(props, "model")
</script>

<template>
    <div :class="{
        'line-through opacity-50': model.isRemoved(),
    }" class="dark:text-slate-300 space-y-2">
        <div class="rounded bg-slate-50 dark:bg-slate-900 px-2 py-1">
            <div class="font-semibold text-sm flex justify-between">
                <div class="flex items-center space-x-1 pr-4 text-slate-300">
                    <div v-if="model.isNew()" title="Model Draft">
                        <PencilSquareIcon class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 animate-pulse" />
                    </div>
                    <div v-if="!model.isNew()" title="Model">
                        <DocumentTextIcon class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 animate-pulse" />
                    </div>
                    <div v-if="model.isAuthenticatable" title="Authenticatable">
                        <UserIcon class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 stroke-2"/>
                    </div>
                    <div>
                        <span class="text-slate-500 dark:text-slate-300">{{ model.name }}</span>
                    </div>
                </div>
                <div class="text-xs text-slate-700">
                    <span v-if="model.isNew()" class="text-slate-350 dark:text-slate-600 text-xs">(Draft)</span>
                    <!-- <span v-else class="text-black dark:text-slate-400 text-xs font-thin">{{ model.getClassString() }}</span> -->
                </div>
            </div>

            <div class="px-2 my-2" v-for="relationship in model.ownRelationships" :key="relationship.id">
                <div class="w-full flex items-center">
                    <span
                        class="flex-grow pr-8 flex items-center text-slate-400"
                    >
                        <span class="font-semibold dark:font-normal text-red-500 dark:text-red-400 text-sm"
                            >{{ relationship.type }}:</span
                        >
                        <span
                            class="font-normal ml-1 text-slate-700 dark:text-slate-300 text-sm"
                            >{{ relationship.relatedModel.name }}</span
                        >
                        <span class="font-semibold dark:font-normal text-slate-500 dark:text-slate-500 text-xs ml-1"
                            >({{ relationship.name }})</span
                        >
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>