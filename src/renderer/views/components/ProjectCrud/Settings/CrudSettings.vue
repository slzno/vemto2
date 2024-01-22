<script setup lang="ts">
    import { ref, defineProps, onMounted } from 'vue'
    import Crud from '@Common/models/crud/Crud'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import CrudCommonSettings from './components/CrudCommonSettings.vue'
    import CrudLivewireSettings from './components/CrudLivewireSettings.vue'
    import CrudFilamentSettings from './components/CrudFilamentSettings.vue'

    const props = defineProps({
        crud: {
            type: Crud,
            required: true
        }
    })

    const projectStore = useProjectStore(),
        selectedTab = ref("common"),
        tabs = [
            { label: "Common", value: "common" }
        ]

    onMounted(() => {
        if(props.crud.isForFilament()) {
            tabs.push({ label: "Filament", value: "filament" })
        }

        if(props.crud.isForLivewire()) {
            tabs.push({ label: "Livewire", value: "livewire" })
        }
    })
</script>
<template>
    <div class="flex flex-col">
        <div class="bg-slate-950">
            <h2 class="p-4 text-white font-bold">CRUD Settings</h2>
            <div>
                <UiTabs 
                    :name="projectStore.project.getTabNameFor(`crud${crud.id}settings`)" 
                    :tabs="tabs" 
                    v-model="selectedTab" 
                />
            </div>
        </div>

        <div class="w-full h-screen mt-2 px-2 pb-40 overflow-scroll">
            <template v-if="selectedTab === 'common'">
                <CrudCommonSettings :crud="crud" />
            </template>

            <template v-if="selectedTab === 'livewire'">
                <CrudLivewireSettings :crud="crud" />
            </template>

            <template v-if="selectedTab === 'filament'">
                <CrudFilamentSettings :crud="crud" />
            </template>
        </div>
    </div>
</template>