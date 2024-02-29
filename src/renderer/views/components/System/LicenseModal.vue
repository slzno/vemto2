<script setup lang="ts">
    import { ref, onMounted, defineExpose, defineProps, Ref } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import UiWarning from "@Renderer/components/ui/UiWarning.vue"
    import LicenseHandler, { LicenseData } from "@Renderer/services/LicenseHandler"

    const props = defineProps({
        showWarning: Boolean,
        warningMessage: String,
    })

    const showingModal = ref(false),
        licenseData = ref({}) as Ref<LicenseData>,
        licenseIsActive = ref(false)

    const licenseHandler = new LicenseHandler()

    onMounted(async () => {
        await checkLicense()
    })

    const checkLicense = async () => {
        await licenseHandler.checkLicense()

        licenseData.value = licenseHandler.getLicense() || {} as LicenseData
        licenseIsActive.value = licenseHandler.isActive()
    }

    const show = () => {
        showingModal.value = true
    }

    const close = () => {
        showingModal.value = false
    }

    const activateLicense = async () => {
        await licenseHandler.activateLicense(licenseData.value.email, licenseData.value.code)

        if(licenseHandler.hasLicense()) {
            licenseIsActive.value = licenseHandler.isActive()
            licenseData.value = licenseHandler.getLicense()
        }
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
                {{  licenseIsActive ? "License is active" : "License is not active" }}

                <UiWarning v-if="showWarning">
                    {{ warningMessage || "You are trying to use a feature that requires a license. Please enter your e-mail and license key to activate it." }}
                </UiWarning>

                <div class="flex flex-col gap-4">
                    <UiText v-model="licenseData.email" label="E-mail" />

                    <UiTextarea v-model="licenseData.code" label="License" />
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
