<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import { defineProps, PropType, toRef, Ref } from "vue"
    import CrudLivewireLogic from './components/CrudLivewireLogic.vue'
    import CrudFilamentCommonLogic from "./components/CrudFilamentCommonLogic.vue"
    import CrudFilamentRelationManagerLogic from "./components/CrudFilamentRelationManagerLogic.vue"
import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true,
            },
        }),
        crud = toRef(props, "crud") as Ref<Crud>
</script>

<template>
    <div>
        <div v-if="crud.isForLivewire()">
            <CrudLivewireLogic :crud="crud" />
        </div>

        <div v-if="crud.isForFilament() && !crud.isDetail()">
            <CrudFilamentCommonLogic :crud="crud" />
        </div>

        <div v-if="crud.isForFilament() && crud.isDetail()">
            <CrudFilamentRelationManagerLogic :crud="crud" />
        </div>

        <div class="p-8" v-else>
            <UiEmptyMessage local>
                Code Hooks Editor for this type of Application is not implemented yet.
            </UiEmptyMessage>
        </div>
    </div>
</template>

<style>
.editableArea--multi-line {
    background-color: #2d3748;
}
</style>