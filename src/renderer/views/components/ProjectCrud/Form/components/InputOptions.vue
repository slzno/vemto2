<script lang="ts" setup>
    import { toRef } from "vue"
    import Input from "@Common/models/crud/Input"
    import debounce from "@Common/tools/debounce"
    import { XMarkIcon } from "@heroicons/vue/24/outline"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"

    const props = defineProps({
        show: Boolean,
        input: Input
    })

    const saveInput = debounce(() => {
        input.value.save()
    }, 500);

    const show = toRef(props, "show"),
        input = toRef(props, "input")
</script>
<template>
    <Transition
        enter-from-class="transition duration-200 translate-y-full"
        enter-to-class="transition duration-200 translate-y-0"
        leave-from-class="transition duration-200 translate-y-0"
        leave-to-class="transition duration-200 translate-y-full"
    >
        <div
            class="fixed right-0 bottom-0 h-screen pt-10 px-4 z-50 text-slate-200"
            style="width: 38rem"
            v-if="show"
        >
            <div class="relative rounded-t-lg bg-slate-850 w-full shadow-2xl border-t border-l border-r border-slate-600 h-full">
                <div class="flex flex-col h-full">
                    <div>
                        <div class="flex justify-between bg-slate-800 p-4 rounded-t-lg">
                            <div class="flex flex-col">
                                <span class="font-semibold">Input Options</span>
                                <div class="text-red-400">{{ input.name }}</div>
                            </div>
                        </div>
        
                        <button
                            class="cursor-pointer flex absolute top-2 right-2"
                            @click="$emit('close')"
                        >
                            <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                        </button>
                    </div>

                    <div class="flex-grow overflow-auto pb-40">
                        <div class="p-4 space-y-4">
                            <UiText v-model="input.name" placeholder="Input Name" disabled label="Name" @input="saveInput()" />

                            <UiText v-model="input.label" placeholder="Input Label" label="Label" @input="saveInput()" />
                            
                            <div v-if="input.allowsPlaceholder()">
                                <UiText v-model="input.placeholder" placeholder="Input Placeholder" label="Placeholder" @input="saveInput()" />
                            </div>

                            <div v-if="input.allowsDefaultValue()">
                                <UiText v-model="input.defaultValue" placeholder="Input Default Value" label="Default Value" @input="saveInput()" />
                            </div>

                            <div v-if="input.allowsMinimumLength()">
                                <UiNumber v-model="input.min" placeholder="Input Minimum Length" label="Minimum Length" @input="saveInput()" />
                            </div>

                            <div v-if="input.allowsMaximumLength()">
                                <UiNumber v-model="input.max" placeholder="Input Maximum Length" label="Maximum Length" @input="saveInput()" />
                            </div>

                            <div v-if="input.allowsStep()">
                                <UiNumber v-model="input.step" placeholder="Input Step" label="Step" @input="saveInput()" />
                            </div>

                            <UiCheckbox v-model="input.showOnCreation" label="On Create" @input="saveInput()" />

                            <UiCheckbox v-model="input.showOnUpdate" label="On Update" @input="saveInput()" />

                            <UiCheckbox v-model="input.showOnDetails" label="On Details" @input="saveInput()" />

                            <UiCheckbox v-model="input.showOnIndex" label="On Index" @input="saveInput()" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>