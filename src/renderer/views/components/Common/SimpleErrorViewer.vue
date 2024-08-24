<script setup lang="ts">
    import { defineProps, ref } from "vue"
    import { DocumentMagnifyingGlassIcon } from "@heroicons/vue/24/outline"
    
    const showingStack = ref(false)

    const props = defineProps({
        errorMessage: {
            type: String,
            required: true,
        },

        errorStack: {
            type: String,
            required: false,
        },
    })
</script>

<template>
    <div class="space-y-2">
        <div class="bg-slate-100 dark:bg-slate-950 rounded-lg p-4">
            <div class="flex  space-x-2 text-red-400">
                <div>Error: {{ errorMessage }}</div>
                <div title="Show error stack" class="cursor-pointer" @click="showingStack = !showingStack">
                    <DocumentMagnifyingGlassIcon class="w-4 h-4 inline-block" />
                </div>
            </div>
            <div v-show="showingStack" class="text-slate-200 p-4 border border-slate-800 overflow-hidden rounded mt-2">
                <pre v-text="errorStack" class="overflow-hidden whitespace-pre-wrap"></pre>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>