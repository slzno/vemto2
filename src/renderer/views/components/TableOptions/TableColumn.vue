<script setup lang="ts">
    import { PropType, Ref, toRef, watch, ref } from "vue"
    import Column from "@Common/models/Column"
    import debounce from "@Common/tools/debounce"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiNumber from "@Renderer/components/ui/UiNumber.vue"
    import { Bars3Icon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"

    const props = defineProps({
        column: {
            type: Object as PropType<Column>,
            required: true,
        },
    })

    const column = toRef(props, "column") as Ref<Column>,
        showingOptions = ref(false)

    watch(() => column.value.name, () => {
        saveColumn()
    })

    // debounced
    const saveColumn = debounce(() => {
        if(column.value.table.hasColumn(column.value.name)) {
            console.log("Column already exists")
            return
        }

        column.value.onNameUpdated()
            .saveFromInterface()
    }, 500)
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
                    <UiText placeholder="Name" :id="`table-column-${column.id}`" v-model="column.name" />
                </div>

                <div class="flex flex-col w-36">
                    <UiSelect v-model="column.type" @change="column.saveFromInterface()">
                        <option value="bigInteger">Big Integer</option>
                        <option value="string">String</option>
                        <option value="timestamp">Timestamp</option>
                        <option value="text">Text</option>
                        <option value="longText">Long Text</option>
                        <option value="boolean">Boolean</option>
                        <option value="decimal">Decimal</option>
                    </UiSelect>
                </div>

                <div class="flex items-center justify-between">
                    <UiCheckbox v-model="column.nullable" label="Nullable" @change="column.saveFromInterface()" />
                </div>
            </div>

            <div class="px-2" @click="showingOptions = !showingOptions">
                <component :is="showingOptions ? ChevronUpIcon : ChevronDownIcon"
                    class="w-4 h-4 text-slate-400 hover:text-red-500 cursor-pointer"
                />
            </div>
        </div>

        <div class="flex m-2 flex-col" v-if="showingOptions">
            <div class="flex gap-3">
                <div class="m-1">
                    <UiCheckbox v-model="column.unique" label="Unique" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.index" label="Index" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1">
                    <UiCheckbox v-model="column.unsigned" label="Unsigned" @change="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3">
                <div class="m-1 flex-1">
                    <UiNumber label="Length" v-model="column.length" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1">
                    <UiText label="Default Value" v-model="column.default" @change="column.saveFromInterface()" />
                </div>
            </div>
            <div class="flex gap-3" v-if="column.isFloatingPointNumber()">
                <div class="m-1 flex-1">
                    <UiNumber label="Precision" v-model="column.total" @change="column.saveFromInterface()" />
                </div>
                <div class="m-1 flex-1">
                    <UiNumber label="Scale" v-model="column.places" @change="column.saveFromInterface()" />
                </div>
            </div>
        </div>
    </div>
</template>
