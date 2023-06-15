<script setup lang="ts">
    import Crud from '@Common/models/crud/Crud'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from 'vue'
    import RenderableLivewireIndexComponent from '@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent'
    import RenderableLivewireCreateComponent from '@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent'
    import RenderableLivewireEditComponent from '@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent'
    // import { useProjectStore } from '@Renderer/stores/useProjectStore'
    
    const props = defineProps({
        crud: {
            type: Object  as PropType<Crud>,
            required: true
        }
    })

    const crud = toRef(props, "crud") as Ref<Crud>,
        createComponentContent = ref(""),
        editComponentContent = ref(""),
        indexComponentContent = ref(""),
        selectedTab = ref("createComponent")

    const tabs = [
        { label: "Create Component", value: "createComponent" },
        { label: "Edit Component", value: "editComponent" },
        { label: "Index Component", value: "indexComponent" },
    ]

    onMounted(async () => {
        console.log(crud.value)

        createComponentContent.value = await new RenderableLivewireCreateComponent(crud.value).compile()
        editComponentContent.value = await new RenderableLivewireEditComponent(crud.value).compile()
    })
</script>

<template>
    <div class="mt-2">
        <UiTabs :tabs="tabs" v-model="selectedTab" :external="true" />
    
        <div v-if="selectedTab === 'createComponent'" class="flex flex-col w-full h-screen space-y-4 mt-2 px-2">
            <textarea v-model="createComponentContent" class="bg-slate-900" cols="30" rows="30"></textarea>
        </div>

        <div v-if="selectedTab === 'editComponent'" class="flex flex-col w-full h-screen space-y-4 mt-2 px-2">
            <textarea v-model="editComponentContent" class="bg-slate-900" cols="30" rows="30"></textarea>
        </div>
    </div>
</template>