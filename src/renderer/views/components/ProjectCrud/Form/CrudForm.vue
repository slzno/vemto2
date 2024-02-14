<script lang="ts" setup>
    import Draggable from 'vuedraggable'
    import * as changeCase from 'change-case'
    import Column from '@Common/models/Column'
    import Crud from '@Common/models/crud/Crud'
    import Input from '@Common/models/crud/Input'
    import Alert from '@Renderer/components/utils/Alert'
    import CrudPanel from '@Common/models/crud/CrudPanel'
    import { PhotoIcon, TrashIcon } from '@heroicons/vue/24/outline'
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

    onMounted(() => {
        crud.value.panels.forEach(panel => {
            panelInputs[panel.id] = panel.getOrderedInputs()
        })

        resetNewInputData()
    })

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

    const removeInput = async (input: Input, panel: CrudPanel) => {
        const confirmed = await window.projectConfirm("Are you sure you want to delete this input?")

        if(!confirmed) return

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
</script>
<template>
    <div class="flex w-full h-screen space-x-4 mt-2 px-2">
        <div class="space-y-4 py-2 w-52">
            <div>
                <h2 class="font-thin text-slate-350 mb-1">Common Inputs</h2>

                <div class="grid grid-cols-2 gap-2">
                    <template v-for="input in inputTypes()" :key="input">
                        <button class="dark:bg-slate-850 border dark:border-slate-800 p-2 rounded font-thin dark:text-slate-250 text-sm dark:hover:bg-slate-950 dark:hover:text-slate-200" @click="addInput(input)">{{ changeCase.pascalCase(input) }}</button>
                    </template>
                </div>
            </div>

            <div>
                <h2 class="text-sm font-thin text-slate-400 mb-1">Relationships</h2>

                <div class="grid grid-cols-2 gap-2">
                    <button class="dark:bg-slate-850 border dark:border-slate-800 p-2 rounded font-thin dark:text-slate-250 text-sm dark:hover:bg-slate-950 dark:hover:text-slate-200" @click="addInput('belongsTo')">Belongs To</button>
                    <button class="dark:bg-slate-850 border dark:border-slate-800 p-2 rounded font-thin dark:text-slate-250 text-sm dark:hover:bg-slate-950 dark:hover:text-slate-200" @click="addRelationship('hasManyDetail')">Has Many</button>
                    <button class="dark:bg-slate-850 border dark:border-slate-800 p-2 rounded font-thin dark:text-slate-250 text-sm dark:hover:bg-slate-950 dark:hover:text-slate-200" :disabled="!crud.isForFilament()" @click="addRelationship('morphMany')">Morph Many</button>
                    <button class="dark:bg-slate-850 border dark:border-slate-800 p-2 rounded font-thin dark:text-slate-250 text-sm dark:hover:bg-slate-950 dark:hover:text-slate-200" :disabled="!crud.isForFilament()" @click="addRelationship('belongsToMany')">Belongs To Many</button>
                    <button class="dark:bg-slate-850 border dark:border-slate-800 p-2 rounded font-thin dark:text-slate-250 text-sm dark:hover:bg-slate-950 dark:hover:text-slate-200" :disabled="!crud.isForFilament()" @click="addRelationship('morphToMany')">Morph To Many</button>
                </div>
            </div>
        </div>

        <!-- Input's Modal -->
        <UiModal width="450px" title="Create Input" :show="showingCreateInputModal" @close="closeInputModal()">
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
        <UiModal width="450px" title="Create Input" :show="showingCreateRelationshipModal" @close="closeDetailModal()">
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

        <div class="flex-grow bg-slate-950 p-4 rounded-lg">
            <section class="border border-dotted border-slate-800 rounded-md p-2 bg-slate-900" v-for="panel in crud.panels" :key="panel.id">
                <h1 class="font-thin text-sm text-slate-400 mb-4">{{ panel.title }}</h1>

                <div class="px-2 py-4">
                    <Draggable
                        class="space-y-2"
                        :list="panelInputs[panel.id]"
                        :item-key="`panel-${panel.id}-inputs-draggable`"
                        @end="saveInputsOrder(panel)"
                    >
                        <template #item="{ element }">
                            <div
                                class="p-2 border group border-dotted rounded-lg border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-850 cursor-pointer"
                                :class="{ '!border-slate-700 bg-slate-850': selectedInput?.id == element.id }"
                                @click="openInputModal(element)"
                            >
                                <div class="flex justify-between">
                                    <div class="flex flex-col">
                                        <i class="text-red-500 text-xs opacity-90">{{ changeCase.pascalCase(element.type) }}</i>
                                        <span class="text-slate-300 font-thin">{{ projectStore.project.getDefaultTranslation(element.label) || element.name }}</span>
                                    </div>
                                    <TrashIcon
                                        class="h-4 w-4 mr-1 invisible group-hover:visible text-red-400 cursor-pointer hover:text-red-500"
                                        @click.stop="removeInput(element, element.panel)"
                                    />
                                </div>
                                
                                <div v-if="element.isImage()" class="flex items-center w-32 h-32 mt-1 dark:text-slate-200 border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                    <PhotoIcon class="w-16 h-16 mx-auto opacity-10 stroke-[0.5]" />
                                </div>
                                <div v-else class="flex items-center w-full mt-1 h-10 dark:text-slate-200 border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded-lg">
                                    <div 
                                        v-if="element.placeholder"
                                        class="text-sm text-slate-300 dark:text-slate-600"
                                    >{{ projectStore.project.getDefaultTranslation(element.placeholder) }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Draggable>
                </div>
            </section>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.hasManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Has Many Detail: {{ detail.detailCrud.getLabel() }}</h1>

                <div class="space-y-1">
                    This is a Has Many Detail
                </div>
            </div>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.morphManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Morph Many Detail: {{ detail.detailCrud.getLabel() }}</h1>

                <div class="space-y-1">
                    This is a Morph Many Detail
                </div>
            </div>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.belongsToManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Morph Many Detail: {{ detail.detailCrud.getLabel() }}</h1>

                <div class="space-y-1">
                    This is a Belongs To Many Detail
                </div>
            </div>

            <div class="border border-dotted border-slate-600 rounded-md p-4" v-for="detail in crud.morphToManyDetails" :key="detail.id">
                <h1 class="font-bold text-lg text-slate-500 mb-4">Morph Many Detail: {{ detail.detailCrud.getLabel() }}</h1>

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