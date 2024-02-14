<script lang="ts" setup>
    import { toRef, ref, PropType, watch } from "vue"
    import Input from "@Common/models/crud/Input"
    import { XMarkIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from '@Renderer/stores/useProjectStore'
    import UiTabs from '@Renderer/components/ui/UiTabs.vue'
    import InputCommonOptions from "./InputCommonOptions.vue"
    import FilamentInputOptions from "./filament/FilamentInputOptions.vue"

    const props = defineProps({
            show: Boolean,
            input: Object as PropType<Input>
        }),
        show = toRef(props, "show"),
        input = toRef(props, "input")

    const selectedTab = ref("common"),
        projectStore = useProjectStore()

    watch(input, (value) => {
        if(!value) return

        if(!value.crud.isForFilament()) {
            tabs.splice(1, 1)
            return
        }

        if(tabs[1] && tabs[1].value == "filament") return

        tabs.push({ label: "Filament", value: "filament" })
    })

    const tabs = [
        { label: "Main", value: "common" }
    ]
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
            v-shortkey="['esc']" @shortkey="$emit('close')"
        >
            <div class="relative rounded-t-lg bg-slate-850 w-full shadow-2xl border-t border-l border-r border-slate-600 h-full">
                <div class="flex flex-col h-full">
                    <div>
                        <div class="flex justify-between flex-col bg-slate-800 rounded-t-lg">
                            <div class="flex flex-col p-4 pb-4">
                                <span class="font-thin font-lg">
                                    Input Options (<span class="text-red-400 px-1">{{ input.name }}</span>)
                                </span>
                            </div>
                            
                            <UiTabs
                                :name="projectStore.project.getTabNameFor(`crud${input.crud.id}input${input.id}`)" 
                                :tabs="tabs" 
                                v-model="selectedTab" 
                                selectedClass="bg-slate-850"
                            />
                        </div>
        
                        <button
                            class="cursor-pointer flex absolute top-2 right-2"
                            @click="$emit('close')"
                        >
                            <XMarkIcon class="w-4 h-4 stroke-2 hover:text-red-500" />
                        </button>
                    </div>

                    <div class="overflow-y-auto" v-if="selectedTab == 'common'">
                        <InputCommonOptions :input="input" />
                    </div>

                    <div class="overflow-y-auto" v-if="selectedTab == 'filament'">
                        <FilamentInputOptions :input="input" />
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>