<script setup lang="ts">
    import UiModal from "./UiModal.vue"
    import UiButton from "./UiButton.vue"
    import { defineExpose, ref } from "vue"
    import { CheckIcon } from "@heroicons/vue/24/outline"

    const showingModal = ref(false)

    const show = () => {
        showingModal.value = true
    }

    const hide = () => {
        showingModal.value = false
    }

    defineExpose({ show, hide })
</script>

<template>
    <UiModal
        width="500px"
        title="Message"
        :show="showingModal"
        @close="hide()"
    >
        <slot />

        <template #footer>
            <div class="flex justify-end p-2 space-x-2">
                <UiButton @click="hide()">
                    <CheckIcon class="w-4 h-4 mr-1 text-green-400" />
                    OK
                </UiButton>
            </div>
        </template>
    </UiModal>
</template>
