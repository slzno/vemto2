<script setup lang="ts">
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import RecursiveNav from "./RecursiveNav.vue"
import UiButton from "@Renderer/components/ui/UiButton.vue";
import { Bars4Icon } from "@heroicons/vue/24/outline";

    const projectStore = useProjectStore()
</script>

<template>

    <div class="mb-3">
        <UiButton>Add Menu Item</UiButton>
    </div>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen">
        <div
            v-for="nav in projectStore.project.getRootNavs()"
            :key="nav.id"
        >
            <div class="mb-2 border border-slate-700 bg-slate-850 rounded-lg p-3 cursor-pointer hover:bg-slate-800 w-96 flex items-center">
                <Bars4Icon class="w-4 h-4 mr-2 text-slate-600" />
                {{ nav.name }}
            </div>
            
            <template v-if="nav.children">
                <RecursiveNav :navs="nav.children" />
            </template>
        </div>
    </div>

</template>
