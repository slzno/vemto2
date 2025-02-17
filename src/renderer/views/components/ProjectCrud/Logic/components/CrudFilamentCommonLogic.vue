<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import HookEditor from "@Renderer/components/editors/HookEditor.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import FilamentResourceRenderable from "@Renderer/codegen/sequential/services/crud/views/filament/FilamentResourceRenderable"
    import FilamentCreateComponentRenderable from "@Renderer/codegen/sequential/services/crud/views/filament/FilamentCreateComponentRenderable"
    import FilamentEditComponentRenderable from "@Renderer/codegen/sequential/services/crud/views/filament/FilamentEditComponentRenderable"
    import FilamentListComponentRenderable from "@Renderer/codegen/sequential/services/crud/views/filament/FilamentListComponentRenderable"
    import FilamentViewComponentRenderable from "@Renderer/codegen/sequential/services/crud/views/filament/FilamentViewComponentRenderable"
    import FilamentCommonRelationManagerRenderable from "@Renderer/codegen/sequential/services/crud/views/filament/FilamentCommonRelationManagerRenderable"
    import HasManyDetail from "@Common/models/crud/HasManyDetail"

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true,
            },
        }),
        projectStore = useProjectStore(),
        crud = toRef(props, "crud") as Ref<Crud>,
        resourceComponentContent = ref(""),
        createComponentContent = ref(""),
        editComponentContent = ref(""),
        listComponentContent = ref(""),
        viewComponentContent = ref(""),
        relationManagerContent = ref(""),
        selectedTab = ref("resourceComponent")

    const tabs = [
        { label: "Resource", value: "resourceComponent" },
        { label: "Create Record", value: "createComponent" },
        { label: "Edit Record", value: "editComponent" },
        { label: "List Records", value: "listComponent" },
        { label: "View Record", value: "viewComponent" }
    ]

    onMounted(async () => {
        resourceComponentContent.value = await new FilamentResourceRenderable(
            crud.value
        ).disableHooks().compile()

        createComponentContent.value = await new FilamentCreateComponentRenderable(
            crud.value
        ).disableHooks().compile()

        editComponentContent.value = await new FilamentEditComponentRenderable(
            crud.value
        ).disableHooks().compile()

        listComponentContent.value = await new FilamentListComponentRenderable(
            crud.value
        ).disableHooks().compile()

        viewComponentContent.value = await new FilamentViewComponentRenderable(
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
                v-if="selectedTab == 'resourceComponent' && resourceComponentContent"
                :content="resourceComponentContent"
                :hooks="crud.getHooks('filamentResource')"
                @hooksUpdated="hooks => crud.saveHooks('filamentResource', hooks)"
            />
            
            <HookEditor
                v-if="selectedTab == 'createComponent' && createComponentContent"
                :content="createComponentContent"
                :hooks="crud.getHooks('filamentCreateComponent')"
                @hooksUpdated="hooks => crud.saveHooks('filamentCreateComponent', hooks)"
            />
    
            <HookEditor
                v-if="selectedTab == 'editComponent' && editComponentContent"
                :content="editComponentContent"
                :hooks="crud.getHooks('filamentEditComponent')"
                @hooksUpdated="hooks => crud.saveHooks('filamentEditComponent', hooks)"
            />
    
            <HookEditor
                v-if="selectedTab == 'listComponent' && listComponentContent"
                :content="listComponentContent"
                :hooks="crud.getHooks('filamentListComponent')"
                @hooksUpdated="hooks => crud.saveHooks('filamentListComponent', hooks)"
            />
    
            <HookEditor
                v-if="selectedTab == 'viewComponent' && viewComponentContent"
                :content="viewComponentContent"
                :hooks="crud.getHooks('filamentViewComponent')"
                @hooksUpdated="hooks => crud.saveHooks('filamentViewComponent', hooks)"
            />
        </div>
    </div>
</template>