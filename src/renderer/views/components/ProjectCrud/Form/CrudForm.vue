<script lang="ts" setup>
    import Draggable from 'vuedraggable'
    import * as changeCase from 'change-case'
    import Column from '@Common/models/Column'
    import Crud from '@Common/models/crud/Crud'
    import Input from '@Common/models/crud/Input'
    import Alert from '@Renderer/components/utils/Alert'
    import CrudPanel from '@Common/models/crud/CrudPanel'
    import { TrashIcon } from '@heroicons/vue/24/outline'
    import InputOptions from './components/InputOptions.vue'
    import UiModal from '@Renderer/components/ui/UiModal.vue'
    import { InputType } from '@Common/models/crud/InputType'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import HasManyDetail from '@Common/models/crud/HasManyDetail'
    import MorphManyDetail from '@Common/models/crud/MorphManyDetail'
    import MorphToManyDetail from '@Common/models/crud/MorphToManyDetail'
    import BelongsToManyDetail from '@Common/models/crud/BelongsToManyDetail'
    import { defineProps, ref, toRef, onMounted, reactive } from 'vue'
    import Relationship from '@Common/models/Relationship'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const props = defineProps({
        crud: {
            type: Crud,
            required: true
        },
    })

    const crud = toRef(props, 'crud'),
        inputOptionsWindow = ref(null),
        showingOptions = ref(false),
        selectedInput = ref(null),
        showingCreateInputModal = ref(false),
        showingCreateRelationshipModal = ref(false),
        creatingRelationshipType = ref(null),
        needsSelectRelationship = ref(false),
        panelInputs = reactive({}) as { [key: string]: Input[] },
        newInputData = ref({
            type: null,
            panelId: null,
            columnId: null,
            column: null,
            relationshipId: null
        }),
        newHasManyDetailRelationship = ref(null)

    const projectStore = useProjectStore()

    const openInputModal = (input: Input) => {
        let time = 0

        if(selectedInput.value) {
            inputOptionsClosed()
            time = 200
        }

        setTimeout(() => {
            showingOptions.value = true
            selectedInput.value = input
        }, time)
    }

    const saveInputsOrder = (panel: CrudPanel) => {
        if(!panelInputs[panel.id]) return
        
        panelInputs[panel.id].forEach((input, index) => {
            input.order = index
            input.save()
        })
    }

    const inputOptionsClosed = () => {
        selectedInput.value = null
        showingOptions.value = false
    }

    const removeInput = (input: Input, panel: CrudPanel) => {
        if(!input || !window.confirm('Are you sure you want to delete this input?')) return

        input.delete()

        panelInputs[panel.id] = panel.getOrderedInputs()
    }

    const inputTypes = () => {
        return Object.values(InputType)
    }

    const addInput = (inputType: string) => {
        showingCreateInputModal.value = true
        needsSelectRelationship.value = inputType == changeCase.pascalCase(InputType.BELONGS_TO)

        newInputData.value.type = inputType as InputType
    }

    const findNewInputColumn = () => {
        if(!newInputData.value.columnId) return

        newInputData.value.column = Column.find(newInputData.value.columnId)
    }

    const createInput = () => {
        const panelId = newInputData.value.panelId,
            columnId = newInputData.value.columnId,
            column = newInputData.value.column,
            relationshipId = newInputData.value.relationshipId,
            type = newInputData.value.type

        if(!panelId) {
            return Alert.error('Please, select a panel to create the input')
        }

        if(!columnId || !column) {
            return Alert.error('Please, select a column to create the input')
        }

        if(needsSelectRelationship.value && !relationshipId) {
            return Alert.error('Please, select a relationship to create the input')
        }

        const input = Input.createFromColumn(crud.value, column, type as InputType)

        if(needsSelectRelationship.value) {
            input.relationshipId = relationshipId
        }

        input.panelId = panelId
        input.save()

        panelInputs[panelId] = input.panel.getOrderedInputs()
        
        closeInputModal()
        resetNewInputData()
    }

    const closeInputModal = (): void => {
        showingCreateInputModal.value = false
        needsSelectRelationship.value = false

        resetNewInputData()
    }

    const addRelationship = (type: string) => {
        creatingRelationshipType.value = type
        showingCreateRelationshipModal.value = true
    }

    const getRelationships = () => {
        if(creatingRelationshipType.value == 'hasManyDetail') {
            return crud.value.model.getHasManyRelations()
        }

        if(creatingRelationshipType.value == 'morphMany') {
            return crud.value.model.getMorphManyRelations()
        }

        if(creatingRelationshipType.value == 'belongsToMany') {
            return crud.value.model.getBelongsToManyRelations()
        }

        if(creatingRelationshipType.value == 'morphToMany') {
            return crud.value.model.getMorphToManyRelations()
        }

        return []
    }

    const closeDetailModal = (): void => {
        showingCreateRelationshipModal.value = false

        resetNewInputData()
    }

    const resetNewInputData = () => {
        newInputData.value = {
            type: null,
            panelId: crud.value.panels[0].id,
            columnId: null,
            column: null,
            relationshipId: null
        }
    }

    const createRelationship = () => {
        if(!newHasManyDetailRelationship.value) {
            return Alert.error('Please, select a relationship to create the detail')
        }

        const relationship = Relationship.find(newHasManyDetailRelationship.value)

        if(!relationship) {
            return Alert.error('Please, select a valid relationship to create the detail')
        }

        switch(creatingRelationshipType.value) {
            case 'hasManyDetail':
                HasManyDetail.createFromRelation(crud.value, relationship)
                break
            case 'morphMany':
                MorphManyDetail.createFromRelation(crud.value, relationship)
                break
            case 'belongsToMany':
                BelongsToManyDetail.createFromRelation(crud.value, relationship)
                break
            case 'morphToMany':
                MorphToManyDetail.createFromRelation(crud.value, relationship)
                break
        }

        newHasManyDetailRelationship.value = null

        closeDetailModal()
    }

    onMounted(() => {
        crud.value.panels.forEach(panel => {
            panelInputs[panel.id] = panel.getOrderedInputs()
        })

        resetNewInputData()
    })
</script>
<template>
    <div class="flex w-full h-screen space-x-4 mt-2 px-2">
        <div class="space-y-2 w-36">
            <template v-for="input in inputTypes()" :key="input">
                <UiButton @click="addInput(input)" class="w-full">{{ changeCase.pascalCase(input) }}</UiButton>
            </template>
            <h2>Master Details</h2>
            <UiButton @click="addRelationship('hasManyDetail')" class="w-full">Add Has Many Detail</UiButton>
            <UiButton :disabled="!crud.isForFilament()" @click="addRelationship('morphMany')" class="w-full">Add Morph Many</UiButton>
            <UiButton :disabled="!crud.isForFilament()" @click="addRelationship('belongsToMany')" class="w-full">Add Belongs To Many Detail</UiButton>
            <UiButton :disabled="!crud.isForFilament()" @click="addRelationship('morphToMany')" class="w-full">Add Morph To Many</UiButton>
        </div>

        <!-- Input's Modal -->
        <UiModal width="25%" title="Create Input" :show="showingCreateInputModal" @close="closeInputModal()">
            <div class="m-2">
                <div class="m-1 flex flex-col gap-2" @keyup.enter="createInput()">
                    <UiSelect v-model="newInputData.panelId" label="Panel">
                        <option :value="null" disabled>Select a panel</option>
                        <option v-for="panel in crud.panels" :value="panel.id" :key="panel.id">{{ panel.title }}</option>
                    </UiSelect>

                    <UiSelect v-model="newInputData.columnId" label="Column" @change="findNewInputColumn">
                        <option :value="null" disabled>Select a column</option>
                        <option v-for="column in crud.table.columns" :value="column.id" :key="column.id">{{ column.name }}</option>
                    </UiSelect>

                    <template v-if="needsSelectRelationship && newInputData.column">
                        <UiSelect v-model="newInputData.relationshipId" label="Relationship" >
                            <option :value="null" disabled>Select a relationship</option>
                            <option v-for="relationship in newInputData.column.getBelongsToRelations()" :value="relationship.id" :key="relationship.id">{{ relationship.name }}</option>
                        </UiSelect>
                    </template>
                </div>
                <div class="m-1 mt-2 flex justify-end">
                    <UiButton @click="createInput()">Create</UiButton>
                </div>
            </div>
        </UiModal>

        <!-- HasManyDetail Modal -->
        <UiModal width="25%" title="Create Input" :show="showingCreateRelationshipModal" @close="closeDetailModal()">
            <div class="m-2">
                <div class="m-1 flex flex-col gap-2" @keyup.enter="createRelationship()">
                    <UiSelect v-model="newHasManyDetailRelationship" label="Relationship" >
                        <option :value="null" disabled>Select a relationship</option>
                        <option v-for="relationship in getRelationships()" :value="relationship.id" :key="relationship.id">{{ relationship.name }}</option>
                    </UiSelect>
                </div>
                <div class="m-1 mt-2 flex justify-end">
                    <UiButton @click="createRelationship()">Create</UiButton>
                </div>
            </div>
        </UiModal>

        <div class="flex-grow bg-slate-950 p-2 rounded-lg">
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
                            class="p-1 border group border-dotted rounded-lg border-transparent hover:border-slate-700 cursor-pointer"
                            :class="{ '!border-slate-700': selectedInput?.id == element.id }"
                            @click="openInputModal(element)"
                        >
                            <div class="flex justify-between">
                                <span>{{ projectStore.project.getDefaultTranslation(element.label) }} <i class="text-slate-500 text-sm">{{ element.type }}</i></span>
                                <TrashIcon
                                    class="h-5 w-5 mr-1 invisible group-hover:visible text-red-400 cursor-pointer hover:text-red-500"
                                    @click.stop="removeInput(element, element.panel)"
                                />
                            </div>
                            
                            <div class="w-full mt-1 h-8 dark:text-slate-200 border-0 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded-lg"></div>
                        </div>
                    </template>
                </Draggable>
            </section>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.hasManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Has Many Detail: {{ detail.detailCrud.settings.collectionTitle }}</h1>

                <div class="space-y-1">
                    This is a Has Many Detail
                </div>
            </div>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.morphManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Morph Many Detail: {{ detail.detailCrud.settings.collectionTitle }}</h1>

                <div class="space-y-1">
                    This is a Morph Many Detail
                </div>
            </div>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.belongsToManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Morph Many Detail: {{ detail.detailCrud.settings.collectionTitle }}</h1>

                <div class="space-y-1">
                    This is a Belongs To Many Detail
                </div>
            </div>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.morphToManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Morph Many Detail: {{ detail.detailCrud.settings.collectionTitle }}</h1>

                <div class="space-y-1">
                    This is a Morph To Many Detail
                </div>
            </div>
        </div>

        <InputOptions
            ref="inputOptionsWindow"
            :show="showingOptions && selectedInput"
            :input="selectedInput"
            @close="inputOptionsClosed()"
        />
    </div>
</template>