<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import HookEditor from "@Renderer/components/editors/HookEditor.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireEditComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent"
    import RenderableLivewireIndexComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true,
            },
        }),
        projectStore = useProjectStore(),
        crud = toRef(props, "crud") as Ref<Crud>,
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
        createComponentContent.value = await new RenderableLivewireCreateComponent(
            crud.value
        ).disableHooks().compile()

        editComponentContent.value = await new RenderableLivewireEditComponent(
            crud.value
        ).disableHooks().compile()

        indexComponentContent.value = await new RenderableLivewireIndexComponent(
            crud.value
        ).disableHooks().compile()
    })
</script>
<template>
    <div
        class="flex flex-col w-full"
        style="height: calc(100vh - 70px)"
    >
        <div class="pt-4">
            <UiTabs
                :name="projectStore.project.getTabNameFor(`crud-code${crud.id}`)"
                :tabs="tabs" 
                v-model="selectedTab" 
                selectedClass="bg-slate-950"
            />
        </div>

        <div class="bg-slate-950 h-full py-4">
            <HookEditor
                v-if="selectedTab == 'createComponent' && createComponentContent"
                :content="createComponentContent"
                :hooks="crud.getHooks('createComponent')"
                @hooksUpdated="hooks => crud.saveHooks('createComponent', hooks)"
            />

            <HookEditor
                v-if="selectedTab == 'editComponent' && editComponentContent"
                :content="editComponentContent"
                :hooks="crud.getHooks('editComponent')"
                @hooksUpdated="hooks => crud.saveHooks('editComponent', hooks)"
            />

            <HookEditor
                v-if="selectedTab == 'indexComponent' && indexComponentContent"
                :content="indexComponentContent"
                :hooks="crud.getHooks('indexComponent')"
                @hooksUpdated="hooks => crud.saveHooks('indexComponent', hooks)"
            />
        </div>
    </div>
</template>