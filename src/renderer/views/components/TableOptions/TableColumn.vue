<script setup lang="ts">
    import { PropType, Ref, toRef, watch } from "vue"
    import Column from "@Common/models/Column"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { Bars3Icon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"

    const props = defineProps({
        column: {
            type: Object as PropType<Column>,
            required: true,
        },
    })

    const column = toRef(props, "column") as Ref<Column>

    watch(() => column.value.name, () => {
        column.value.saveFromInterface()
    })
</script>

<template>
    <div
        :class="{
            'border-yellow-400': column.autoIncrement,
            'border-red-400': column.isForeign(),
            'border-orange-400': column.isUnique(),
        }"
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div class="flex space-x-2 items-center">
            <div class="px-2">
                <Bars3Icon
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-move"
                />
            </div>

            <div class="flex flex-grow space-x-2">
                <div class="flex flex-col flex-grow">
                    <UiText placeholder="Name" v-model="column.name" />
                </div>

                <div class="flex flex-col w-36">
                    <UiSelect v-model="column.typeDefinition">
                        <option value="bigInteger">Big Integer</option>
                        <option value="string">String</option>
                        <option value="timestamp">Timestamp</option>
                        <option value="text">Text</option>
                        <option value="longText">Long Text</option>
                    </UiSelect>
                </div>

                <div class="flex items-center justify-between">
                    <UiCheckbox v-model="column.nullable" label="Nullable" />
                </div>
            </div>

            <div class="px-2">
                <ChevronDownIcon
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"
                />
            </div>
        </div>
    </div>
</template>
