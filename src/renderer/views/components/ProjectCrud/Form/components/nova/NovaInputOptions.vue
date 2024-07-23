<script setup lang="ts">
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { toRef, defineProps, ref, PropType } from 'vue'
    import Input from "@Common/models/crud/Input"
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    
    const props = defineProps({
            input: Object as PropType<Input>
        }),
        input = toRef(props, "input")

    const selectedTab = ref("form"),
        projectStore = useProjectStore()

    const tabs = [
        { label: "Form Input", value: "form" },
        { label: "Table Column", value: "column" }
    ]
</script>
<template>
    <div class="flex-grow overflow-auto pb-40">
        <div class="pt-4">
            <UiTabs
                :name="projectStore.project.getTabNameFor(`crud${input.crud.id}input${input.id}filament`)" 
                :tabs="tabs" 
                v-model="selectedTab" 
                selectedClass="bg-slate-850"
            />
        </div>
        
        <div v-if="selectedTab === 'form'">

        </div>

        <div v-if="selectedTab === 'column'">
            
        </div>
    </div>
</template>