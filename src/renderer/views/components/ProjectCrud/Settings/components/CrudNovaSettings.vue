<script setup lang="ts">
    import { defineProps, toRef, PropType } from 'vue'
    import Crud from '@Common/models/crud/Crud'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue';
    import UiNumber from '@Renderer/components/ui/UiNumber.vue';
    import UiSelect from '@Renderer/components/ui/UiSelect.vue';

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true
            }
        }),
        crud = toRef(props, "crud")
</script>
<template>
    <div class="space-y-4">
        <div>
            <UiCheckbox v-model="crud.novaSettings.displayInNavigation" label="Display in navigation" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.novaSettings.group" label="Group" @input="crud.save()" />
        </div>

        <div>
            <UiSelect label="Table Style" v-model="crud.novaSettings.tableStyle" @change="crud.save()">
                <option value="default">Default</option>
                <option value="tight">Tight</option>
            </UiSelect>
        </div>

        <div>
            <UiCheckbox v-model="crud.novaSettings.showColumnBorders" label="Show column borders" @input="crud.save()" />
        </div>

        <div>
            <UiSelect label="Click Action" v-model="crud.novaSettings.clickAction" @change="crud.save()">
                <option value="detail">Detail</option>
                <option value="edit">Edit</option>
                <option value="select">Select</option>
                <option value="preview">Preview</option>
                <option value="ignore">Ignore</option>
            </UiSelect>
        </div>

        <div>
            <UiCheckbox v-model="crud.novaSettings.trafficCop" label="Traffic Cop" @input="crud.save()" />
        </div>

        <div>
            <UiCheckbox v-model="crud.novaSettings.polling" label="Polling" @input="crud.save()" />
        </div>

        <div v-show="!! crud.novaSettings.polling" class="pt-2 pl-2 rounded-lg bg-slate-950 gap-4 flex flex-col justify-center">
            <div>
                <UiNumber v-model="crud.novaSettings.pollingInterval" label="Polling Interval" @input="crud.save()" />
            </div>

            <div>
                <UiCheckbox v-model="crud.novaSettings.showPollingToggle" label="Show Polling Toggle" @input="crud.save()" />
            </div>
        </div>

        <div>
            <UiNumber v-model="crud.novaSettings.debounce" label="Debounce" @input="crud.save()" />
        </div>
    </div>
</template>