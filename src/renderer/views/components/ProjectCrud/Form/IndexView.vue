<script lang="ts" setup>
    import Draggable from "vuedraggable"
    import Crud from '@Common/models/crud/Crud'
    import Input from '@Common/models/crud/Input'
    import CrudPanel from '@Common/models/crud/CrudPanel'
    import InputOptions from './components/InputOptions.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import { defineProps, ref, toRef, onMounted, reactive } from 'vue'

    const props = defineProps({
        crud: {
            type: Crud,
            required: true,
        },
    })

    const crud = toRef(props, 'crud'),
        inputOptionsWindow = ref(null),
        showingOptions = ref(false),
        selectedInput = ref(null),
        panelInputs = reactive({}) as {[key: string]: Input[]}

    const openInputModal = (input: Input) => {
        if(selectedInput.value) inputOptionsClosed()

        showingOptions.value = true
        selectedInput.value = input
    }

    const saveInputsOrder = (panel: CrudPanel) => {
        panelInputs[panel.id].forEach((input, index) => {
            input.order = index
            input.save()
        })
    }

    const inputOptionsClosed = () => {
        selectedInput.value = null
        showingOptions.value = false
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
            <!-- crud.panels as panel div -->
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
                            class="p-1 border border-dotted rounded border-transparent hover:border-slate-700 cursor-pointer"
                            :class="{ '!border-slate-700': selectedInput?.id == element.id }"
                            @click="openInputModal(element)"
                        >
                            {{ element.label }} <i class="text-slate-500 text-sm">{{ element.type }}</i>
                            <div class="w-full mt-1 h-8 dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg"></div>
                        </div>
                    </template>
                </Draggable>
            </section>
        </div>

        <InputOptions ref="inputOptionsWindow" :show="showingOptions && selectedInput" :input="selectedInput" @close="inputOptionsClosed()" />
    </div>
</template>