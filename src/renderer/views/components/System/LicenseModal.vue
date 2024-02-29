<script setup lang="ts">
    import { ref, onMounted, defineExpose, defineProps, Ref } from "vue"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiTextarea from "@Renderer/components/ui/UiTextarea.vue"
    import UiWarning from "@Renderer/components/ui/UiWarning.vue"
    import LicenseHandler, { LicenseData } from "@Renderer/services/LicenseHandler"
import Main from "@Renderer/services/wrappers/Main"
import { CheckIcon, CubeTransparentIcon, ShoppingBagIcon, ShoppingCartIcon } from "@heroicons/vue/24/outline"

    defineProps({
        showWarning: Boolean,
        warningMessage: String,
    })

    const showingModal = ref(false),
        licenseData = ref({}) as Ref<LicenseData>,
        licenseIsActive = ref(false),
        processing = ref(false)

    const licenseHandler = new LicenseHandler()

    onMounted(async () => {
        await checkLicense()
    })

    const checkLicense = async () => {
        processing.value = true

        await licenseHandler.checkLicense()

        licenseData.value = licenseHandler.getLicense() || {} as LicenseData
        licenseIsActive.value = licenseHandler.isActive()

        processing.value = false
    }

    const show = async () => {
        showingModal.value = true

        await checkLicense()
    }

    const close = () => {
        showingModal.value = false
    }

    const activateLicense = async () => {
        processing.value = true

        await licenseHandler.activateLicense(licenseData.value.email, licenseData.value.code)

        if(licenseHandler.hasLicense()) {
            licenseIsActive.value = licenseHandler.isActive()
            licenseData.value = licenseHandler.getLicense()
        }

        processing.value = false
    }

    const revokeLicense = async () => {
        processing.value = true

        await licenseHandler.revokeLicense()

        licenseIsActive.value = licenseHandler.isActive()

        processing.value = false
    }

    const buyLicense = () => {
        Main.API.openURL("https://vemto.app/buy")
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
        :processing="processing"
        @close="close"
    >
        <div class="p-4">
            <div class="m-1 flex flex-col gap-4">
                <UiWarning v-if="showWarning">
                    {{ warningMessage || "You are trying to use a feature that requires a license. Please enter your e-mail and license key to activate it." }}
                </UiWarning>

                <div class="flex flex-col gap-4">
                    <UiText v-model="licenseData.email" label="E-mail" :disabled="licenseIsActive" />

                    <UiTextarea v-model="licenseData.code" label="License" :disabled="licenseIsActive" />

                    <div>
                        <div class="inline-block p-1 px-2 bg-slate-800 border border-green-800 text-green-500 rounded text-sm font-thin" v-if="licenseIsActive">
                            <div>License is active</div>
                            <div>Expiration date: {{ licenseHandler.getExpirationDate() }}</div>
                        </div>
                    </div>
                </div>
    
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between p-2">
                <UiButton @click="buyLicense()">
                    <ShoppingCartIcon class="w-4 h-4 mr-1 text-red-500" />
                    <div>Buy License</div>
                </UiButton>

                <UiButton v-if="licenseIsActive" @click="revokeLicense">
                    <CubeTransparentIcon class="w-4 h-4 mr-1 text-red-500" />
                    <div>Vacate License</div>
                </UiButton>
                <UiButton v-else @click="activateLicense">
                    <CheckIcon class="w-4 h-4 mr-1 text-green-500" />
                    <div>Activate</div>
                </UiButton>
            </div>
        </template>
    </UiModal>

</template>
