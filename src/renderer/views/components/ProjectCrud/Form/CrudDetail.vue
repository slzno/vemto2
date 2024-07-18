<script setup lang="ts">
    import { Ref, defineProps, toRef } from 'vue'
    import { TableCellsIcon, TrashIcon } from '@heroicons/vue/24/outline'
    import { useRouter } from 'vue-router'
    import HasManyDetail from '@Common/models/crud/HasManyDetail';
    import BelongsToManyDetail from '@Common/models/crud/BelongsToManyDetail';
    import MorphManyDetail from '@Common/models/crud/MorphManyDetail';
    import MorphToManyDetail from '@Common/models/crud/MorphToManyDetail';
    import UiWarning from '@Renderer/components/ui/UiWarning.vue';
    
    const router = useRouter()

    const props = defineProps({
        type: {
            type: String,
            required: true
        },
        detail: {
            type: Object,
            required: true
        }
    })

    const detail = toRef(props, 'detail') as Ref<HasManyDetail|BelongsToManyDetail|MorphManyDetail|MorphToManyDetail>

    const removeDetail = async () => {
        const confirmed = await window.projectConfirm("Are you sure you want to delete this detail?")

        if(!confirmed) return

        detail.value.delete()
    }

    const openCrud = () => {
        router.push({ name: "project-crud", params: { crudId: detail.value.detailCrud.id } })
    }
</script>
<template>
    <div class="border border-dotted border-slate-800 rounded-md p-2 bg-slate-900 hover:bg-slate-850 group cursor-pointer" @click="openCrud()">
        <div class="flex justify-between">
            <i class="text-red-500 text-xs opacity-90">{{ type }}</i>
            <TrashIcon
                class="h-4 w-4 mr-1 invisible group-hover:visible text-red-400 cursor-pointer hover:text-red-500"
                @click.stop="removeDetail()"
            />
        </div>
        <div class="flex justify-center">
            <div>
                <h1 class="font-thin text-nomal text-slate-400">
                    {{ type }} {{ detail.detailCrud.getLabel() }}
                </h1>

                <div class="flex flex-col items-center">
                    <TableCellsIcon class="w-24 h-24 text-slate-700 stroke-[0.015rem]" />
                </div>
            </div>
        </div>
        <div v-if="detail instanceof HasManyDetail && detail.hasInvalidItemOrCollectionName()" class="p-2 max-w-lg">
            <UiWarning>
                This detail has the same Item Name or Collection Name of the parent Crud. Please, change this in the Detail Settings to avoid conflicts. 
                <br>
                This is a common issue when the parent Crud and the detail Crud are related to the same table/model (e.g. User has many Users)
            </UiWarning>
        </div>
    </div>
</template>