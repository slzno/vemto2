<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableLivewireIndexComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireIndexComponent"
    import RenderableLivewireCreateComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireCreateComponent"
    import RenderableLivewireEditComponent from "@Renderer/codegen/sequential/services/crud/views/livewire/RenderableLivewireEditComponent"
    import HookEditor from "@Renderer/components/editors/HookEditor.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const props = defineProps({
        crud: {
            type: Object as PropType<Crud>,
            required: true,
        },
    })

    const crud = toRef(props, "crud") as Ref<Crud>,
        projectStore = useProjectStore(),
        selectedTab = ref("createComponent")

    let createComponentContent = ref("")

    const tabs = [
        { label: "Create Component", value: "createComponent" },
        { label: "Edit Component", value: "editComponent" },
        { label: "Index Component", value: "indexComponent" },
    ]

    onMounted(async () => {
        createComponentContent.value = await new RenderableLivewireCreateComponent(
            crud.value
        ).disableHooks().compile()
    })
</script>

<template>
    <div class="mt-2">
        <UiTabs
            :name="projectStore.project.getTabNameFor(`crud-code${crud.id}`)"
            :tabs="tabs" 
            v-model="selectedTab" 
        />

        <div
            v-show="selectedTab === 'createComponent'"
            class="flex flex-col w-full space-y-4 mt-2 px-2"
            style="height: calc(100vh - 122px)"
        >
            <HookEditor
                v-if="createComponentContent"
                :content="createComponentContent"
                :hooks="crud.getHooks('createComponent')"
                @hooksUpdated="hooks => crud.saveHooks('createComponent', hooks)"
            />
        </div>

        <div
            v-show="selectedTab === 'editComponent'"
            class="flex flex-col w-full h-screen space-y-4 mt-2 px-2"
        >
            <textarea
                class="bg-slate-900"
                cols="30"
                rows="30"
            ></textarea>
        </div>
    </div>
</template>

<style>
.editableArea--multi-line {
    background-color: #2d3748;
}
</style>