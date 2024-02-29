<script setup lang="ts">
    import { ref, defineExpose } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import UiInfo from "@Renderer/components/ui/UiInfo.vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import LicenseModal from "./LicenseModal.vue"

    const showingModal = ref(false),
        selectedTab = ref("license"),
        licenseModal = ref(null)

    const tabs = [
        { label: "License", value: "license" },
        { label: "Paths", value: "paths" },
        { label: "Theme", value: "theme" },
    ]

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
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
        <LicenseModal ref="licenseModal" />
        
        <div class="mt-3">
            <UiTabs selected-class="bg-white dark:bg-slate-850" name="systemSettings" :tabs="tabs" v-model="selectedTab" />
        </div>

        <div class="space-y-2 p-4" v-if="selectedTab === 'license'">
            <div class="space-y-2">
                <UiButton @click="licenseModal.show()">Change License</UiButton>
            </div>
        </div>
    </UiModal>

</template>
