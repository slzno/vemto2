<script setup lang="ts">
    import Crud from "@Common/models/crud/Crud"
    import { defineProps, PropType, toRef, Ref } from "vue"
    import CrudLivewireLogic from './components/CrudLivewireLogic.vue'
    import CrudFilamentLogic from "./components/CrudFilamentLogic.vue"

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

        <div v-if="crud.isForFilament() && !crud.isHasManyDetail">
            <CrudFilamentLogic :crud="crud" />
        </div>
    </div>
</template>

<style>
.editableArea--multi-line {
    background-color: #2d3748;
}
</style>