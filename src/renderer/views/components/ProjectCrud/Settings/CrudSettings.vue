<script setup lang="ts">
    import { ref, defineProps, onMounted, PropType, toRef } from 'vue'
    import Crud from '@Common/models/crud/Crud'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import CrudCommonSettings from './components/CrudCommonSettings.vue'
    import CrudLivewireSettings from './components/CrudLivewireSettings.vue'
    import CrudFilamentSettings from './components/CrudFilamentSettings.vue'

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true
            }
        }),
        crud = toRef(props, "crud")

    const projectStore = useProjectStore(),
        selectedTab = ref("common"),
        tabs = [
            { label: "Common", value: "common" }
        ]

    onMounted(() => {
        if(crud.value.isForFilament()) {
            tabs.push({ label: "Filament", value: "filament" })
        }

        if(crud.value.isForLivewire()) {
            tabs.push({ label: "Livewire", value: "livewire" })
        }
    })
</script>
<template>
    <div class="flex flex-col">
        <div class="pt-4">
            <div>
                <UiTabs 
                    :name="projectStore.project.getTabNameFor(`crud${crud.id}settings`)" 
                    :tabs="tabs" 
                    v-model="selectedTab" 
                />
            </div>
        </div>

        <div class="w-full h-screen mt-2 px-6 pt-4 pb-96 overflow-scroll">
            <div class="w-1/2" v-if="selectedTab === 'common'">
                <CrudCommonSettings :crud="crud" />
            </div>

            <div class="w-1/2" v-if="selectedTab === 'livewire'">
                <CrudLivewireSettings :crud="crud" />
            </div>

            <div class="w-1/2" v-if="selectedTab === 'filament'">
                <CrudFilamentSettings :crud="crud" />
            </div>
        </div>
    </div>
</template>