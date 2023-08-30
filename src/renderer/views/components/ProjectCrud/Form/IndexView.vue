<script lang="ts" setup>
    import Draggable from "vuedraggable"
    import Crud from '@Common/models/crud/Crud'
    import Input from '@Common/models/crud/Input'
    import { TrashIcon } from '@heroicons/vue/24/outline'
    import CrudPanel from '@Common/models/crud/CrudPanel'
    import InputOptions from './components/InputOptions.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { defineProps, ref, toRef, onMounted, reactive } from 'vue'

    const props = defineProps({
        crud: {
            type: Crud,
            required: true
        },
    })

    const crud = toRef(props, 'crud'),
        inputOptionsWindow = ref(null),
        showingOptions = ref(false),
        selectedInput = ref(null),
        panelInputs = reactive({}) as { [key: string]: Input[] }

    const openInputModal = (input: Input) => {
        if(selectedInput.value) inputOptionsClosed()

        showingOptions.value = true
        selectedInput.value = input
    }

    const saveInputsOrder = (panel: CrudPanel) => {
        if(!panelInputs[panel.id]) return
        
        panelInputs[panel.id].forEach((input, index) => {
            input.order = index
            input.save()
        })
    }

    const inputOptionsClosed = () => {
        selectedInput.value = null
        showingOptions.value = false
    }

    const removeInput = (input: Input) => {
        if(!input) return

        input.delete()

        if(!panelInputs[input.panelId]) return

        panelInputs[input.panelId] = input.panel.getOrderedInputs()
    }

    onMounted(() => {
        crud.value.panels.forEach(panel => {
            panelInputs[panel.id] = panel.getOrderedInputs()
        })
    })
</script>
<template>
    <div class="flex w-full h-screen space-x-4 mt-2 px-2">
        <div class="space-y-2">
            <UiButton class="w-full">Text</UiButton>
            <UiButton class="w-full">Image</UiButton>
            <UiButton class="w-full">Belongs To</UiButton>
        </div>

        <div class="flex-grow bg-slate-950 p-2 rounded-lg">
            <section class="border border-dotted border-slate-600 rounded-md p-4" v-for="panel in crud.panels" :key="panel.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">{{ panel.title }}</h1>

                <Draggable
                    class="space-y-1"
                    :list="panelInputs[panel.id]"
                    :item-key="`panel-${panel.id}-inputs-draggable`"
                    @end="saveInputsOrder(panel)"
                >
                    <template #item="{ element }">
                        <div
                            class="p-1 border group border-dotted rounded-lg border-transparent hover:border-slate-700 cursor-pointer"
                            :class="{ '!border-slate-700': selectedInput?.id == element.id }"
                            @click="openInputModal(element)"
                        >
                            <div class="flex justify-between">
                                <span>{{ element.label }} <i class="text-slate-500 text-sm">{{ element.type }}</i></span>
                                <TrashIcon
                                    class="h-5 w-5 mr-1 invisible group-hover:visible text-red-400 cursor-pointer hover:text-red-500"
                                    @click.stop="removeInput(element)"
                                />
                            </div>
                            
                            <div class="w-full mt-1 h-8 dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg"></div>
                        </div>
                    </template>
                </Draggable>
            </section>
        </div>

        <InputOptions ref="inputOptionsWindow" :show="showingOptions && selectedInput" :input="selectedInput" @close="inputOptionsClosed()" />
    </div>
</template>