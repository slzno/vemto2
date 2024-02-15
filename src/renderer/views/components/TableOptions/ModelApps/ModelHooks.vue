<script setup lang="ts">
    import Model from "@Common/models/Model"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { defineProps, ref, PropType, toRef } from "vue"
    import HookEditor from "@Renderer/components/editors/HookEditor.vue"
    import RenderableModel from "@Renderer/codegen/sequential/services/model/RenderableModel"
    import RenderableSeeder from "@Renderer/codegen/sequential/services/model/RenderableSeeder"
    import RenderableFactory from "@Renderer/codegen/sequential/services/model/RenderableFactory"
    import RenderablePolicy from "@Renderer/codegen/sequential/services/model/RenderablePolicy"
    
    const props = defineProps({
            model: {
                type: Object as PropType<Model>,
                required: true,
            },
        }),
        model = toRef(props, "model"),
        showingHooksModal = ref(false),
        activeHookName = ref(""),
        modelHooksContent = ref("")

    const showHooksModal = async (hookName: string) => {
        activeHookName.value = hookName

        await setModelHookContent()

        showingHooksModal.value = true
    }

    const closeHooksModal = (): void => {
        showingHooksModal.value = false
        activeHookName.value = ""
    }

    const setModelHookContent = async () => {
        const renderableClasses = {
            'model': RenderableModel,
            'factory': RenderableFactory,
            'seeder': RenderableSeeder,
            'policy': RenderablePolicy
        }

        if(! renderableClasses[activeHookName.value]) return

        const renderableClass = new renderableClasses[activeHookName.value](model.value)
        renderableClass.disableHooks()

        modelHooksContent.value = await renderableClass.compile()
    }
</script>
<template>
    <div>
        <UiModal 
            title="Edit Hooks"
            width="1300px"
            height="calc(100vh - 5rem)"
            :show="showingHooksModal && !! activeHookName.length"
            @close="closeHooksModal"
        >
            <HookEditor
                :content="modelHooksContent"
                :hooks="model.getHooks(activeHookName)"
                @hooksUpdated="hooks => model.saveHooks(activeHookName, hooks)"
            />
        </UiModal>

        <div class="space-y-2">
            <UiButton @click="showHooksModal('model')">Model</UiButton>
            <UiButton @click="showHooksModal('policy')">Policy</UiButton>
            <UiButton @click="showHooksModal('seeder')">Seeder</UiButton>
            <UiButton @click="showHooksModal('factory')">Factory</UiButton>
        </div>
    </div>
</template>