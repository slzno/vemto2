<script setup lang="ts">
    import UiButton from '@Renderer/components/ui/UiButton.vue';
    import UiInfo from '@Renderer/components/ui/UiInfo.vue';
    import UiModal from '@Renderer/components/ui/UiModal.vue';
    import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
    import { ref, defineExpose } from 'vue'
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import SequentialGenerator from '@Renderer/codegen/sequential/SequentialGenerator';
    import Main from '@Renderer/services/wrappers/Main';
    import Crud from '@Common/models/crud/Crud';
import ApiInstaller from '@Renderer/services/project/installer/composer/ApiInstaller';

    const apiModal = ref(null),
        showingModal = ref(false),
        projectStore = useProjectStore(),
        installing = ref(false)

    let promise = null,
        onFinishCallback = null

    const check = async (sequentialGenerator: SequentialGenerator) => {
        const apiCruds = Crud.getApis(),
            projectComposerData = sequentialGenerator.packageChecker.projectInfo.composerData

        if(!apiCruds.length) return
        if(projectComposerData.require["laravel/sanctum"] || localStorage.getItem(`doNotShowApiRequirements_${projectStore.project.id}`)) return

        showingModal.value = true

        promise = await new Promise((resolve) => {
            onFinishCallback = resolve
        })
    }

    const installApiRequirements = async () => {
        installing.value = true
        
        await ApiInstaller.installFromProjectGeneration(projectStore.project)
        
        showingModal.value = false
        installing.value = false

        onFinishCallback()
    }

    const cancelInstallApiRequirements = () => {
        localStorage.setItem(`doNotShowApiRequirements_${projectStore.project.id}`, 'true')

        showingModal.value = false

        onFinishCallback()
    }

    defineExpose({ check })
</script>
<template>    
    <div>
        <UiModal
            width="35%"
            title="API Requirements"
            ref="apiModal"
            :show="showingModal"
            @close="cancelInstallApiRequirements()"
            :on-top-of-everything="true"
            :processing="installing"
        >
            <div class="p-2">
                <UiInfo>
                    You have API CRUDs but the project does not have the Laravel Sanctum package installed. Do you want to install it now?
                </UiInfo>
            </div>
            <template #footer>
                <div class="flex justify-between p-2 space-x-2">
                    <UiButton @click="cancelInstallApiRequirements()">
                        <XMarkIcon class="w-4 h-4 mr-1 text-red-400" />
                        Just Continue
                    </UiButton>
                    <UiButton @click="installApiRequirements()">
                        <CheckIcon class="w-4 h-4 mr-1 text-green-400" />
                        Install
                    </UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>