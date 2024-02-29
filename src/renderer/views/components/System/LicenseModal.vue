<script setup lang="ts">
    import { ref, onMounted, defineExpose } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import UiInfo from "@Renderer/components/ui/UiInfo.vue"
    import LicenseHandler from "@Renderer/services/LicenseHandler"

    const showingModal = ref(false),
        licenseEmail = ref(""),
        licenseCode = ref("")

    onMounted(async () => {
        
    })

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
    }

    const activateLicense = async () => {
        const handler = new LicenseHandler()

        handler.activateLicense(licenseEmail.value, licenseCode.value)
    }

    defineExpose({
        show,
        close,
    })
</script>

<template>
    <UiModal
        width="700px"
        title="Settings"
        :show="showingModal"
        @close="close"
    >
        <div class="p-4">
            <div class="m-1 flex flex-col gap-4">

                <UiInfo>
                    You are trying to use a feature that requires a license. Please enter your e-mail and license key to activate it.
                </UiInfo>

                <div class="flex flex-col gap-4">
                    <UiText v-model="licenseEmail" label="E-mail" />

                    <UiTextarea v-model="licenseCode" label="License" />
                </div>
    
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between p-2">
                <UiButton >
                    <div>Buy License</div>
                </UiButton>

                <UiButton @click="activateLicense">
                    <div>Activate</div>
                </UiButton>
            </div>
        </template>
    </UiModal>

</template>
