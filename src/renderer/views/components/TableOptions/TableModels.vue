<script setup lang="ts">
    import { PropType, toRef } from "vue"
    import Model from "@Common/models/Model"
    import TableModel from "./TableModel.vue"
    import { PlusCircleIcon } from "@heroicons/vue/24/outline"

    const props = defineProps({
        models: {
            type: Array as PropType<Model[]>,
            required: true,
        },
    })

    const models = toRef(props, "models")
</script>

<template>
    <div>
        <section class="space-y-2">
            <TableModel
                v-for="model in models"
                :key="model.id"
                :model="model"
            />
        </section>

        <section
            class="mt-4 flex w-full justify-center text-slate-400 hover:text-red-500 cursor-pointer text-lg"
        >
            <div class="flex items-center">
                <PlusCircleIcon class="w-8 h-8" />
                <span class="px-1.5">Add model</span>
            </div>
        </section>
    </div>
</template>
