<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue";
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const projectStore = useProjectStore()
</script>

<template>
    <div class="mb-3">
        <UiButton>Add Route</UiButton>
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen">
        <div
            class="mb-2 border border-slate-700 bg-slate-850 rounded-lg p-3 cursor-pointer hover:bg-slate-800 w-2/3 flex justify-between items-start"
            v-for="route in projectStore.project.routes"
            :key="route.id"
        >
            <div>
                <div class="mt-2 space-x-3 font-mono">
                    <span
                        class="px-2 py-0.5 bg-green-300 text-green-700 rounded"
                        >{{ route.method.toUpperCase() }}</span
                    >
                    <span>{{ route.path }}</span>
                </div>
            </div>
    
            <div>
                <div
                    class="rounded px-2 py-1 bg-slate-800 inline-block text-sm"
                >
                    {{ route.getName() }}
                </div>
            </div>
        </div>
    </div>
</template>
