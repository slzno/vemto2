<script setup lang="ts">
    import { defineProps, toRef, onMounted, ref, onBeforeUnmount } from 'vue'
    import Relationship from "@Renderer/../common/models/Relationship"
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { TrashIcon, PlusCircleIcon } from "@heroicons/vue/24/outline"
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import CommonRelationship from './TableRelationships/CommonRelationship.vue'
    import ManyToManyRelationship from './TableRelationships/ManyToManyRelationship.vue'
    import MorphRelationship from './TableRelationships/MorphRelationship.vue'
    import ThroughRelationship from './TableRelationships/ThroughRelationship.vue'
    import RelationshipTypes from '@Common/models/static/RelationshipTypes'
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import UiOptionsDropdown from '@Renderer/components/ui/UiOptionsDropdown.vue'
    import UiDropdownItem from '@Renderer/components/ui/UiDropdownItem.vue'
import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue'

    const props = defineProps(['model', 'models']),
        models = toRef(props, 'models'),
        model = toRef(props, 'model'),
        relationships = ref([]),
        confirmDeleteDialog = ref(null)

    onMounted(() => {
        loadRelationships()
    })

    onBeforeUnmount(() => {
        checkRelationshipValidity()
    })

    const loadRelationships = () => {
        relationships.value = model.value.ownRelationships
    }

    const getRelatedModelRelationshipsForSelect = (relationship: Relationship) => {
        if(!relationship.relatedModelId) return []

        const possibleRelationships = relationship.relatedModel.getPossibleInverseRelationships(relationship)

        return possibleRelationships.map((rel: Relationship) => {
            return {
                key: rel.id,
                label: rel.getLabel()
            }
        })
    }
        
    const newRelationship = (): void => {
        const relationship = new Relationship({
            modelId: model.value.id,
            projectId: model.value.projectId
        })

        relationships.value.push(relationship)
    }

    const saveRelationship = (relationship: Relationship) => {
        if(relationship.id) {
            relationship.saveFromInterface()
            loadRelationships()
            return
        }

        relationship.processAndSave(true)
        loadRelationships()
    }

    const onRelationshipRemoving = async (relationship: Relationship, force: boolean = false) => {
        const removeRelationshipFromUI = (): void => {
            relationships.value.splice(relationships.value.indexOf(relationship), 1)
        }

        if(!relationship.isSaved()) {
            return removeRelationshipFromUI()
        }

        const removeRelationship = (): void => {
            relationship.delete()
            removeRelationshipFromUI()
        }

        if(force) {
            removeRelationship()
            return
        }

        const inverseRelationship = relationship.inverse
        
        const confirmed = await confirmDeleteDialog.value.confirm()
        if(!confirmed) return

        removeRelationship()
        
        if(confirmed.deleteInverse && inverseRelationship) {
            inverseRelationship.delete()
        }

        loadRelationships()
    }

    const checkRelationshipValidity = (): void => {
        relationships.value.forEach((relationship: Relationship) => {
            if(!relationship.type || !relationship.name) {
                onRelationshipRemoving(relationship, true)
            }
        })
    }

    const onEscapePressed = (relationship: Relationship): void => {
        if(!relationship.isNew()) return

        if(!relationship.type || !relationship.name) {
            onRelationshipRemoving(relationship, true)
        }
    }

    const getForSelect = (
            collection: any,
            keyName: string = 'id',
            labelName: string = 'name'
        ) => {
        return collection.map((model: any) => {
            return {
                key: model[keyName],
                label: model[labelName]
            }
        })
    }
</script>
<template>
    <div>
        <UiConfirm ref="confirmDeleteDialog" :options="{
            'deleteInverse': {
                'label': 'Delete inverse relationship',
                'value': true
            }
        }">
            Are you sure you want to delete this relationship?
        </UiConfirm>

        <div>
            <div
                class="mb-2 bg-slate-850 p-3 rounded-md space-y-1.5 border border-slate-700"
                v-for="relationship in relationships"
                :key="relationship.id"
                @keyup.escape="onEscapePressed(relationship)"
            >
            
            <div class="flex justify-between mb-4">
                <div class="text-red-400 font-thin overflow-visible">
                    {{ relationship.model?.name }}.{{ relationship.name }}
                </div>

                <div class="mt-1">
                    <UiOptionsDropdown>
                        <UiDropdownItem @click="onRelationshipRemoving(relationship)">
                            <TrashIcon class="h-5 w-5 mr-1 text-red-400" /> Delete
                        </UiDropdownItem>
                    </UiOptionsDropdown>
                </div>
            </div>

            <div class="flex flex-col gap-1 space-y-1.5">

                    <div class="space-x-1 flex justify-between">
                        <!-- <UiButton @click="relationship.logDataComparison()">Log data comparison</UiButton> -->

                        <div class="text-red-400 flex gap-1 flex-1">
                            <div class="flex-1">
                                <UiDropdownSelect
                                    label="Type"
                                    v-model="relationship.type"
                                    :may-open="relationship.isNew() && !relationship.hasType()"
                                    placeholder="Relationship Type"
                                    :options="RelationshipTypes.getForDropdown()"
                                    @change="relationship.calculateDefaultData()"
                                />
                            </div>

                            <div class="flex-1">
                                <template v-if="! relationship.isThrough()">
                                    <UiDropdownSelect
                                        label="Model"
                                        v-model="relationship.relatedModelId"
                                        :may-open="relationship.isNew() && !relationship.hasRelatedModel() && relationship.hasType()"
                                        placeholder="Relationship Model"
                                        :options="getForSelect(models)"
                                        @change="relationship.calculateDefaultData()"
                                    />
                                </template>
                                <template v-else>
                                    <UiText
                                        label="Name"
                                        placeholder="Relationship Name"
                                        v-model="relationship.name"
                                    />
                                </template>
                            </div>
                        </div>
                    </div>

                    <template v-if="relationship.isCommon()">
                        <CommonRelationship
                            :relationship="relationship"
                            :get-for-select="getForSelect"
                        />
                    </template>

                    <template v-if="relationship.isManyToMany()">
                        <ManyToManyRelationship
                            :relationship="relationship"
                            :get-for-select="getForSelect"
                        />
                    </template>

                    <template v-if="relationship.isMorph()">
                        <MorphRelationship
                            :relationship="relationship"
                        />
                    </template>

                    <template v-if="relationship.isThrough()">
                        <ThroughRelationship
                            :models="models"
                            :relationship="relationship"
                            :get-for-select="getForSelect"
                        />
                    </template>
                </div>

                <template v-if="relationship.relatedModelId">
                    <UiDropdownSelect
                        label="Inverse Relationship"
                        v-model="relationship.inverseId"
                        placeholder="Inverse Relationship (optional)"
                        :options="getRelatedModelRelationshipsForSelect(relationship)"
                    />
                </template>
                
                <div v-if="relationship.isManyToMany()">
                    <UiCheckbox v-model="relationship.withPivotColumns" label="With Pivot Columns" @input="$emit('save')" />
                </div>
                <div class="flex justify-end items-center space-x-2">
                    <small class="text-slate-500" v-show="relationship.hasUnsavedData()">
                        There are unsaved changes
                    </small>
                    <UiButton
                        v-if="relationship.hasTypeAndRelatedModel()"
                        @click="saveRelationship(relationship)"
                    >
                        Save
                    </UiButton>
                </div>
            </div>
        </div>

        <div>
            <UiButton
                @click="newRelationship()"
            >
                <span class="flex items-center">
                    <PlusCircleIcon class="h-5 w-5 mr-1" /> Add Relationship
                </span>
            </UiButton>
        </div>
    </div>
</template>