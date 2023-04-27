<script setup lang="ts">
    import { PropType, Ref, toRef, ref, onMounted, defineEmits } from "vue"
    import Model from "@Common/models/Model"
    import debounce from "@Common/tools/debounce"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiMultiSelect from "@Renderer/components/ui/UiMultiSelect.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import Column from "@Renderer/../common/models/Column"
    import TableModelRelationships from './TableModelRelationships.vue'

    const props = defineProps({
        model: {
            type: Object as PropType<Model>,
            required: true,
        },
    })

    const model = toRef(props, "model") as Ref<Model>,
        showModelOptions = ref(false),
        emit = defineEmits(['removeModel'])
    
    let models: Ref<Array<Model>> = ref([])

    onMounted((): void => {
        const project = model.value.project
        
        models.value = project.models
    })

    const saveModelData = debounce((isNameChange: boolean) => {
        if(isNameChange) {
            model.value.calculateDataByName()
        }
        
        model.value.saveFromInterface()
    }, 500)

    const getSelectDataForLayout = (property: Array<string>|Column[]): Array<Object> => {
        if(!property || !Array.isArray(property)) return []

        return property.map((guarded: string|Column) => {
            if(typeof guarded === "object") {
                guarded = guarded.name
            }

            return {
                label: guarded,
                value: guarded.toLowerCase(),
            }
        })
    }

    const saveModelPropertyFromSelect = (selectValue: Array<Object>, modelProperty: string): void => {
        model.value[modelProperty] = selectValue.map((item: any) => item.value)

        saveModelData()
    }

    const deleteModel = (): void => {
        Main.API.confirm("Are you sure you want to remove this model?").then((confirmed: boolean) => {
            if(!confirmed) return

            model.value.remove()
            emit('removeModel')
        })
    }
</script>

<template>
    <div
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div>
            <div class="flex justify-between gap-2">
                <UiText
                    v-model="model.namespace"
                    placeholder="Model namespace"
                    @change="saveModelData()"
                />
                <UiText
                    v-model="model.name"
                    placeholder="Model name"
                    @change="saveModelData(true)"
                />
                <div class="p-1 relative">
                    <EllipsisVerticalIcon class="h-6 w-6 text-slate-400 cursor-pointer" @click="showModelOptions = !showModelOptions" />
                    <div class="bg-slate-950 w-auto rounded absolute p-1 right-0 top-8 border border-gray-700" v-if="showModelOptions">
                        <ul>
                            <li class="flex items-center justify-start text-md p-1 cursor-pointer" @click="deleteModel()">
                                <TrashIcon class="h-5 w-5 mr-1 text-red-400" />
                                Delete
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="mt-2">
                <UiText 
                    v-model="model.plural"
                    placeholder="Collection"
                    @change="saveModelData()"
                />
            </div>
            <div class="mt-2 flex gap-3">
                <UiCheckbox
                    label="Has Timestamps"
                    v-model="model.hasTimestamps"
                    @change="saveModelData()"
                />
                <UiCheckbox
                    label="Has SoftDeletes"
                    v-model="model.hasSoftDeletes"
                    @change="saveModelData()"
                />
            </div>

            <div class="mt-4 bg-slate-850 rounded-md space-y-1 p-2 flex flex-col gap-1">
                <div>
                    <UiCheckbox
                        label="Has Guarded"
                        v-model="model.hasGuarded"
                        @change="saveModelData()"
                    />
                </div>

                <div v-if="model.hasGuarded">
                    <UiMultiSelect
                        inputLabel="Guarded"
                        :default-value="getSelectDataForLayout(model.guarded)"
                        @change="$event => saveModelPropertyFromSelect($event, 'guarded')"
                        :options="getSelectDataForLayout(model.table.getColumns())" />
                </div>
            </div>

            <div class="mt-4 bg-slate-850 rounded-md space-y-1 p-2 flex flex-col gap-1">
                <div>
                    <UiCheckbox
                        label="Has Fillable"
                        v-model="model.hasFillable"
                        @change="saveModelData()"
                    />
                </div>

                <div v-if="model.hasFillable">
                    <UiMultiSelect
                        inputLabel="Fillable"
                        :default-value="getSelectDataForLayout(model.fillable)"
                        @change="$event => saveModelPropertyFromSelect($event, 'fillable')"
                        :options="getSelectDataForLayout(model.table.getColumns())" />
                </div>
            </div>

            <TableModelRelationships
                :model="model"
                :models="models"
            />
        </div>
    </div>
</template>
