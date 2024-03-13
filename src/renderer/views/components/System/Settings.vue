<script setup lang="ts">
    import { ref, defineExpose } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import UiInfo from "@Renderer/components/ui/UiInfo.vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import LicenseModal from "./LicenseModal.vue"
    import LicenseHandler from "@Renderer/services/LicenseHandler"
    import { CheckIcon, PencilSquareIcon } from "@heroicons/vue/24/outline"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
    import Alert from "@Renderer/components/utils/Alert"
    
    const licenseHandler = new LicenseHandler()
    
    const showingModal = ref(false),
        selectedTab = ref("license"),
        licenseModal = ref(null),
        licenseIsActive = ref(false),
        phpPath = ref(""),
        composerPath = ref("")

    const tabs = [
        { label: "License", value: "license" },
        { label: "Paths", value: "paths" },
        { label: "Theme", value: "theme" },
    ]

    const show = () => {
        showingModal.value = true

        phpPath.value = localStorage.getItem("phpPath") || ""
        composerPath.value = localStorage.getItem("composerPath") || ""
        
        readLicenseStatus()
    }

    const close = () => {
        showingModal.value = false
    }

    const readLicenseStatus = () => {
        licenseIsActive.value = licenseHandler.isActive()
    }

    const savePaths = () => {
        localStorage.setItem("phpPath", phpPath.value)
        localStorage.setItem("composerPath", composerPath.value)

        Alert.info("Paths updated successfully")
    }

    defineExpose({
        show,
        close,
    })
</script>

<template>
    <UiModal
        width="700px"
        height="500px"
        title="Settings"
        :show="showingModal"
        @close="close"
    >
        <LicenseModal 
            ref="licenseModal" 
            @close="readLicenseStatus()"
        />
        
        <div class="mt-3">
            <UiTabs selected-class="bg-white dark:bg-slate-850" name="systemSettings" :tabs="tabs" v-model="selectedTab" />
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'license'">
            <div>
                <div class="inline-block p-1 px-2 bg-slate-800 border border-green-800 text-green-500 rounded text-sm font-thin" v-if="licenseIsActive">
                    <div>License is active</div>
                    <div>Expiration date: {{ licenseHandler.getExpirationDate() }}</div>
                </div>

                <div class="inline-block p-1 px-2 bg-slate-800 border border-slate-700 text-slate-400 rounded text-sm font-thin" v-else>
                    <div>License is not active</div>
                </div>  
            </div>

            <div class="space-y-2">
                <UiButton @click="licenseModal.show()">
                    <PencilSquareIcon class="h-4 w-4 mr-1 text-red-500" />
                    <span>Change License</span>
                </UiButton>
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'paths'">
            <div>
                <UiText v-model="phpPath" label="PHP Path (folder + executable)"></UiText>
            </div>

            <div>
                <UiText v-model="composerPath" label="Composer Path"></UiText>
            </div>
            
            <div class="mt-2">
                <UiButton @click="savePaths()">
                    <CheckIcon class="h-4 w-4 mr-1 text-green-500" />
                    <span>Save</span>
                </UiButton>
            </div>
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'theme'">
            <UiEmptyMessage local>
                Under development
            </UiEmptyMessage>
        </div>
    </UiModal>

</template>
