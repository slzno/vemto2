<script lang="ts">
    import UiModal from "./UiModal.vue"
    import UiButton from "./UiButton.vue"
    import UiCheckbox from "./UiCheckbox.vue"
    import { ref, toRefs, onMounted } from "vue"
    import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline"

    export default {
        name: "UiConfirm",
        components: {
            UiModal,
            UiButton,
            UiCheckbox,
            CheckIcon,
            XMarkIcon,
        },
        props: {
            title: {
                type: String,
                default: "Confirm",
            },
            cancelText: {
                type: String,
                default: "Cancel",
            },
            confirmText: {
                type: String,
                default: "Confirm",
            },
            width: {
                type: String,
                default: "30%",
            },
            height: {
                type: String,
                default: "auto",
            },
            optionsTitle: {
                type: String,
                default: "",
            },
            options: {
                type: Object as () => { [key: string]: { label: string; value: boolean } },
                default: () => ({}),
            },
        },
        setup(props) {
            const show = ref(false),
                optionsValues = ref({})

            const {
                title,
                cancelText,
                confirmText,
                width,
                height,
                optionsTitle,
                options,
            } = toRefs(props)

            let confirmPromise = null,
                confirmPromiseResolve = null

            onMounted(() => {
                Object.keys(options.value).forEach((option) => {
                    const optionSettings = options.value[option]
                    optionsValues.value[option] = optionSettings.value
                })
            })

            const confirm = () => {
                show.value = true

                confirmPromise = new Promise((resolve) => {
                    confirmPromiseResolve = resolve
                })

                return confirmPromise
            }

            const cancelClicked = () => {
                show.value = false

                if (!confirmPromiseResolve) return

                confirmPromiseResolve(false)
            }

            const confirmClicked = () => {
                show.value = false

                if (!confirmPromiseResolve) return
                
                confirmPromiseResolve(optionsValues.value)
            }

            return {
                props,
                show,
                title,
                cancelText,
                confirmText,
                width,
                height,
                optionsTitle,
                options,
                optionsValues,
                confirm,
                cancelClicked,
                confirmClicked,
            }
        },
    }
</script>

<template>
    <div>
        <UiModal
            :show="show"
            :on-top-of-everything="true"
            :title="title"
            :width="width"
            :height="height"
            @close="cancelClicked"
        >
            <div class="p-4">
                <slot></slot>
            </div>

            <div class="p-4" v-if="Object.keys(options).length">
                <div class="text-slate-300 mb-3 text-xs" v-if="optionsTitle">{{ optionsTitle }}</div>
                <div v-for="(option, key) in options">
                    <UiCheckbox v-model="optionsValues[key]" :label="option.label"></UiCheckbox>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end p-4 space-x-2">
                    <UiButton @click="cancelClicked">
                        <XMarkIcon class="w-4 h-4 mr-1 text-red-400" />
                        {{ cancelText }}
                    </UiButton>
                    <UiButton @click="confirmClicked">
                        <CheckIcon class="w-4 h-4 mr-1 text-green-400" />
                        {{ confirmText }}
                    </UiButton>
                </div>
            </template>
        </UiModal>
    </div>
</template>

<style scoped></style>
