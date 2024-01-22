<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import HookEditor from "@Renderer/components/editors/HookEditor.vue"
    import { ref, defineProps, onMounted, PropType, toRef, Ref } from "vue"
    import RenderableFilamentCommonRelationManager from "@Renderer/codegen/sequential/services/crud/views/filament/RenderableFilamentCommonRelationManager"

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true,
            },
        }),
        projectStore = useProjectStore(),
        crud = toRef(props, "crud") as Ref<Crud>,
        relationManagerComponentContent = ref(""),
        selectedTab = ref("relationManagerComponent")

    const tabs = [
        { label: "Relation Manager", value: "relationManagerComponent" },
    ]

    const getFirstCrudDetail = () => {
        if(crud.value.isHasManyDetail) {
            return crud.value.getFirstRelatedHasManyDetail()
        }

        if(crud.value.isMorphManyDetail) {
            return crud.value.getFirstRelatedMorphManyDetail()
        }

        if(crud.value.isBelongsToManyDetail) {
            return crud.value.getFirstRelatedBelongsToManyDetail()
        }
    }

    onMounted(async () => {
        const firstCrudDetail = getFirstCrudDetail()

        if(!firstCrudDetail) return

        relationManagerComponentContent.value = await new RenderableFilamentCommonRelationManager(
            firstCrudDetail
        ).disableHooks().compile()
    })
</script>
<template>
    <div
        class="flex flex-col w-full space-y-4"
        style="height: calc(100vh - 122px)"
    >
        <div class="bg-slate-950 pt-2">
            <UiTabs
                :name="projectStore.project.getTabNameFor(`crud-code${crud.id}`)"
                :tabs="tabs" 
                v-model="selectedTab" 
            />
        </div>

        <HookEditor
            v-if="selectedTab == 'relationManagerComponent' && relationManagerComponentContent"
            :content="relationManagerComponentContent"
            :hooks="crud.getHooks('filamentRelationManager')"
            @hooksUpdated="hooks => crud.saveHooks('filamentRelationManager', hooks)"
        />
    </div>
</template>