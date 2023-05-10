<script setup lang="ts">
    import { defineProps, toRef, onMounted, ref, onBeforeUnmount } from 'vue'
    import debounce from "@Common/tools/debounce"
    import Main from "@Renderer/services/wrappers/Main"
    import Relationship from "@Renderer/../common/models/Relationship"
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import Model from "@Common/models/Model"
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { EllipsisVerticalIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import RelationshipTypes from '@Common/models/static/RelationshipTypes'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'

    const props = defineProps(['model', 'models']),
        models = toRef(props, 'models'),
        model = toRef(props, 'model'),
        relationshipIdOptions = ref(null),
        relationships = ref([])

    const getRelationshipTypesForSelect = () => {
        return RelationshipTypes.getForDropdown()
    }

    const getModelsForSelect = () => {
        return models.value.map((model: Model) => {
            return {
                key: model.id,
                label: model.name
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

    const finishRelationshipCreation = (relationship: Relationship): void => {
        relationship.processAndSave(true)
    }

    const saveRelationship = debounce((relationship: Relationship) => {
        if(relationship.hasType() && relationship.hasRelatedModel()) {
            relationship.calculateDefaultData()
        }

        relationship.saveFromInterface()
    }, 500)

    const toggleRelationshipOptions = (relationship: Relationship): void => {
        relationshipIdOptions.value = (
            relationshipIdOptions.value === relationship.id
                ? null
                : relationship.id
        )
    }

    const onRelationshipRemoving = (relationship: Relationship, force: boolean = false): void => {
        const removeRelationshipFromUI = (): void => {
            relationships.value.splice(relationships.value.indexOf(relationship), 1)
        }

        if(!relationship.isSaved()) {
            return removeRelationshipFromUI()
        }

        const removeRelationship = (): void => {
            relationship.remove()
            removeRelationshipFromUI()
        }

        if(force) {
            removeRelationship()
            return
        }

        Main.API.confirm("Are you sure you want to remove this relationship?").then((confirmed: boolean) => {
            if(!confirmed) return

            removeRelationship()
        })
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

    onMounted(() => {
        relationships.value = model.value.ownRelationships
    })

    onBeforeUnmount(() => {
        checkRelationshipValidity()
    })
</script>
<template>
    <div class="mt-4">
        <h2 class="text-slate-500 font-semibold mb-1">Relationships</h2>

        <div>
            <div
                class="mb-2 bg-slate-850 p-2 rounded-md space-y-1"
                v-for="relationship in relationships"
                :key="relationship.id"
                @keyup.escape="onEscapePressed(relationship)"
            >
                <!-- <UiButton @click="relationship.logDataComparison()">Log data comparison</UiButton> -->
                
                <div class="flex justify-between">
                    <div class="space-x-1 flex">
                        <div class="text-red-400 inline-block">
                            <UiDropdownSelect
                                v-model="relationship.type"
                                :may-open="relationship.isNew() && !relationship.hasType()"
                                placeholder="Relationship Type"
                                :options="getRelationshipTypesForSelect()"
                                @change="saveRelationship(relationship)"
                            />
                        </div>

                        <template v-if="!relationship.isThrough()">
                            <UiDropdownSelect
                                v-model="relationship.relatedModelId"
                                :may-open="relationship.isNew() && !relationship.hasRelatedModel() && relationship.hasType()"
                                placeholder="Relationship Model"
                                :options="getModelsForSelect()"
                                @change="saveRelationship(relationship)"
                            />
                        </template>
                        <template v-else>
                            <UiText placeholder="Relationship Name" v-model="relationship.name" />
                        </template>
                    </div>

                    <span class="relative">
                        <EllipsisVerticalIcon
                            class="h-6 w-6 text-slate-400 cursor-pointer"
                            @click="toggleRelationshipOptions(relationship)"
                        />
                        <div class="bg-slate-950 w-auto rounded absolute p-1 right-0 top-8 border border-gray-700" v-if="relationshipIdOptions === relationship.id">
                            <ul>
                                <li class="flex items-center justify-start text-md p-1 cursor-pointer" @click="onRelationshipRemoving(relationship)">
                                    <TrashIcon class="h-5 w-5 mr-1 text-red-400" />
                                    Delete
                                </li>
                            </ul>
                        </div>
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <template v-if="relationship.hasTypeAndRelatedModel() && !relationship.isThrough()">
                        <template v-if="relationship.isCommon()">
                            <div>
                                <UiText
                                    v-model="relationship.name"
                                    placeholder="Relationship name"
                                    @input="saveRelationship(relationship)"
                                />
                            </div>
                            <div>
                                <UiText
                                    v-model="relationship.foreignKeyName"
                                    placeholder="Foreign Key Name"
                                    @input="saveRelationship(relationship)"
                                />
                            </div>
                        </template>

                        <template v-if="relationship.isManyToMany()">
                            <div class="flex flex-col gap-1">
                                <div class="flex-1 flex gap-1">
                                    <div>
                                        <UiText
                                            v-model="relationship.name"
                                            placeholder="Relationship Name"
                                            @input="saveRelationship(relationship)"
                                        />
                                    </div>
                                    <div>
                                        <UiText
                                            v-model="relationship.pivotTableName"
                                            placeholder="Pivot Table Name"
                                            @input="saveRelationship(relationship)"
                                        />
                                    </div>
                                </div>
                                <div class="flex-1 flex gap-1">
                                    <div>
                                        <UiText
                                            v-model="relationship.foreignPivotKeyName"
                                            placeholder="Foreign Pivot Key Name"
                                            @input="saveRelationship(relationship)"
                                        />
                                    </div>
                                    <div>
                                        <UiText
                                            v-model="relationship.relatedPivotKeyName"
                                            placeholder="Related Pivot Key Name"
                                            @input="saveRelationship(relationship)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-if="relationship.isMorph()"> 
                            <div>
                                <UiText
                                    v-model="relationship.name"
                                    placeholder="Relationship name"
                                    @input="saveRelationship(relationship)"
                                />
                            </div>
                            <div>
                                <UiText
                                    v-model="relationship.morphTo"
                                    placeholder="Morph To"
                                    @input="saveRelationship(relationship)"
                                />
                            </div>
                        </template>
                    </template>

                    <template v-if="relationship.isThrough()">
                        <div>
                            <UiDropdownSelect
                                v-model="relationship.relatedModelId"
                                :may-open="relationship.isNew() && !relationship.hasRelatedModel() && !relationship.throughId"
                                placeholder="Related Model"
                                :options="getModelsForSelect()"
                                @change="saveRelationship(relationship)"
                            />
                        </div>
                        <div>
                            <UiDropdownSelect
                                v-model="relationship.throughId"
                                :may-open="relationship.isNew() && relationship.hasRelatedModel() && !relationship.throughId"
                                placeholder="Through Model"
                                :options="getModelsForSelect()"
                                @change="saveRelationship(relationship)"
                            />
                        </div>
                        <div>
                            <UiText
                                v-model="relationship.relatedKeyName"
                                placeholder="Related Model Key Name"
                                @input="saveRelationship(relationship)"
                            />
                        </div>
                        <div>
                            <UiText
                                v-model="relationship.throughKeyName"
                                placeholder="Through Model Key Name"
                                @input="saveRelationship(relationship)"
                            />
                        </div>
                    </template>
                </div>

                <div>
                    <UiButton
                        v-if="relationship.hasTypeAndRelatedModel()"
                        @click="finishRelationshipCreation(relationship)"
                    >
                        Save Relationship
                    </UiButton>
                </div>
            </div>
        </div>

        <div>
            <UiButton
                @click="newRelationship()"
            >
                <span class="flex items-center">
                    <PlusIcon class="h-4 w-4 mr-1" /> Add relationship
                </span>
            </UiButton>
        </div>
    </div>
</template>