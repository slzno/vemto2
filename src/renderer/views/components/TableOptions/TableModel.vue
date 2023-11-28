<script setup lang="ts">
    import { PropType, Ref, toRef, ref, onMounted, defineEmits } from "vue"
    import Model from "@Common/models/Model"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import { TrashIcon } from "@heroicons/vue/24/outline"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiMultiSelect from "@Renderer/components/ui/UiMultiSelect.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import Column from "@Renderer/../common/models/Column"
    import TableModelRelationships from './TableModelRelationships.vue'
    import UiWarning from "@Renderer/components/ui/UiWarning.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"

    const onDevelopment = Main.API.onDevelopment()

    const props = defineProps({
        model: {
            type: Object as PropType<Model>,
            required: true,
        },
    })

    const projectStore = useProjectStore(), 
        model = toRef(props, "model") as Ref<Model>,
        emit = defineEmits(['removeModel']),
        modelPluralReference = ref(null),
        selectedTab = ref("data")
    
    let models: Ref<Array<Model>> = ref([])

    const tabs = [
        { label: "Data", value: "data" },
        { label: "Relationships", value: "relationships" },
        { label: "Code", value: "code" },
        { label: "Settings", value: "settings" },
    ]

    onMounted((): void => {
        const project = model.value.project
        
        models.value = project.models
    })

    const saveModelData = (nameWasChanged: boolean = false) => {
        if(nameWasChanged) {
            model.value.calculateDataByName()
        }
        
        model.value.saveFromInterface()
    }

    const saveModelCollection = () => {
        if(!model.value.plural || !model.value.plural.length) {
            model.value.plural = modelPluralReference.value
            return
        }

        modelPluralReference.value = null
        saveModelData()
    }

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

    const saveFillableColumns= (selectValue: Array<Object>): void => {
        const columnsNames = selectValue.map((item: any) => item.value)

        model.value.saveFillableColumns(columnsNames)
    }

    const saveGuardedColumns = (selectValue: Array<Object>): void => {
        const columnsNames = selectValue.map((item: any) => item.value)

        model.value.saveGuardedColumns(columnsNames)
    }

    const deleteModel = (): void => {
        Main.API.confirm("Are you sure you want to remove this model?").then((confirmed: boolean) => {
            if(!confirmed) return

            model.value.remove()
            emit('removeModel')
        })
    }

    const log = (data: any): void => {
        console.log(data)
    }
</script>

<template>
    <div
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div class="mb-2">
            <UiTabs 
                :name="projectStore.project.getTabNameFor(`table${model.table.id}-model${model.id}`)"
                :tabs="tabs" 
                v-model="selectedTab" 
                selected-class="bg-slate-800"  
            />
        </div>

        <div v-show="selectedTab === 'data'">
            <UiWarning class="mb-2" v-if="model.isNew()">
                <span>This model was not saved to the filesystem yet. Please generate the code pressing F5 to save it</span>
            </UiWarning>

            <div class="flex justify-between gap-2">
                <UiText
                    v-model="model.namespace"
                    placeholder="Model namespace"
                    @input="saveModelData()"
                />
                <UiText
                    v-model="model.name"
                    placeholder="Model name"
                    @input="saveModelData(true)"
                />
                <div class="flex items-center justify-center">
                    <UiOptionsDropdown>
                        <UiDropdownItem @click="deleteModel()">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
            </div>
            <div class="mt-2">
                <UiText 
                    label="Collection"
                    v-model="model.plural"
                    placeholder="Collection"
                    @blur="saveModelCollection()"
                    @focus="modelPluralReference = $event"
                />
            </div>
            <div class="mt-4 flex gap-3">
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
                        :default-value="getSelectDataForLayout(model.guardedColumns)"
                        @change="$event => saveGuardedColumns($event)"
                        :options="getSelectDataForLayout(model.table.getColumns())"
                    />
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
                        :default-value="getSelectDataForLayout(model.fillableColumns)"
                        @change="$event => saveFillableColumns($event)"
                        :options="getSelectDataForLayout(model.table.getColumns())"
                    />
                </div>
            </div>

            <div class="mt-4" v-if="onDevelopment">
                <UiButton @click="log(model)">Log details</UiButton>
                <UiButton @click="model.logDataComparison()">Log data comparison</UiButton>
            </div>
        </div>

        <div v-show="selectedTab === 'relationships'">
            <TableModelRelationships
                :model="model"
                :models="models"
            />
        </div>
    </div>
</template>
