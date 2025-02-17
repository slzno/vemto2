<script setup lang="ts">
    import Model from "@Common/models/Model"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { defineProps, ref, PropType, toRef } from "vue"
    import HookEditor from "@Renderer/components/editors/HookEditor.vue"
    import ModelRenderable from "@Renderer/codegen/sequential/services/model/ModelRenderable"
    import SeederRenderable from "@Renderer/codegen/sequential/services/model/SeederRenderable"
    import FactoryRenderable from "@Renderer/codegen/sequential/services/model/FactoryRenderable"
    import PolicyRenderable from "@Renderer/codegen/sequential/services/model/PolicyRenderable"
    
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
        try {
            
            const renderableClasses = {
                'model': ModelRenderable,
                'factory': FactoryRenderable,
                'seeder': SeederRenderable,
                'policy': PolicyRenderable
            }
    
            if(! renderableClasses[activeHookName.value]) return
    
            const renderableClass = new renderableClasses[activeHookName.value](model.value)
            renderableClass.disableHooks()
    
            modelHooksContent.value = await renderableClass.compileWithErrorThreatment()
        } catch (error) {
            console.log("ERROR setting model hook content")

            throw error
        }
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