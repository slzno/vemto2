<script setup lang="ts">
    import { defineProps, toRef, onMounted, ref, onBeforeUnmount } from 'vue'
    import debounce from "@Common/tools/debounce"
    import Main from "@Renderer/services/wrappers/Main"
    import Relationship from "@Renderer/../common/models/Relationship"
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import Model from "@Common/models/Model"
    import { PlusIcon, EllipsisVerticalIcon, TrashIcon } from "@heroicons/vue/24/outline"
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import CommonRelationship from './TableRelationships/CommonRelationship.vue'
    import ManyToManyRelationship from './TableRelationships/ManyToManyRelationship.vue'
    import MorphRelationship from './TableRelationships/MorphRelationship.vue'
    import ThroughRelationship from './TableRelationships/ThroughRelationship.vue'
    import RelationshipTypes from '@Common/models/static/RelationshipTypes'

    const props = defineProps(['model', 'models']),
        models = toRef(props, 'models'),
        model = toRef(props, 'model'),
        relationshipIdOptions = ref(null),
        relationships = ref([])

    const getForSelect = (
            collection: any,
            keyName: string = 'id',
            labelName: string = 'name'
        ) => {
        return collection.map((model: Model) => {
            return {
                key: model[keyName],
                label: model[labelName]
            }
        })
    }

    const getRelatedModelRelationshipsForSelect = (relationship: Relationship) => {
        if(!relationship.relatedModelId) return []

        return relationship.relatedModel
            .ownRelationships.map((relatedModelRelationship: Relationship) => {
                return {
                    key: relatedModelRelationship.id,
                    label: relatedModelRelationship.name
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
            relationship.delete()
            removeRelationshipFromUI()
        }

        if(force) {
            removeRelationship()
            return
        }

        const inverseRelationship = relationship.inverse

        Main.API.confirm("Are you sure you want to remove this relationship?")
            .then((confirmed: boolean) => {
                if(!confirmed) return

                removeRelationship()
            })

        if(!inverseRelationship) return

        Main.API.confirm(`This relationship has an inverse relationship called ${inverseRelationship.name}. Do you want to remove it as well?`)
            .then((confirmed: boolean) => {
                if(!confirmed) return

                inverseRelationship.delete()
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

                <div class="flex flex-col gap-1">
                    <div class="space-x-1 flex justify-between">
                        <!-- <UiButton @click="relationship.logDataComparison()">Log data comparison</UiButton> -->

                        <div class="text-red-400 flex gap-1 flex-1">
                            <div class="flex-1">
                                <UiDropdownSelect
                                    v-model="relationship.type"
                                    :may-open="relationship.isNew() && !relationship.hasType()"
                                    placeholder="Relationship Type"
                                    :options="RelationshipTypes.getForDropdown()"
                                    @change="saveRelationship(relationship)"
                                />
                            </div>

                            <div class="flex-1">
                                <template v-if="! relationship.isThrough()">
                                    <UiDropdownSelect
                                        v-model="relationship.relatedModelId"
                                        :may-open="relationship.isNew() && !relationship.hasRelatedModel() && relationship.hasType()"
                                        placeholder="Relationship Model"
                                        :options="getForSelect(models)"
                                        @change="saveRelationship(relationship)"
                                    />
                                </template>
                            
                                <template v-else>
                                    <UiText
                                        placeholder="Relationship Name"
                                        v-model="relationship.name"
                                        @input="saveRelationship(relationship)"
                                    />
                                </template>
                            </div>
                        </div>

                        <span class="relative mt-1">
                            <EllipsisVerticalIcon
                                class="h-6 w-6 text-slate-400 cursor-pointer"
                                @click="toggleRelationshipOptions(relationship)"
                            />
                            <div class="bg-slate-950 w-auto rounded absolute p-1 z-10 right-0 top-8 border border-gray-700" v-if="relationshipIdOptions === relationship.id">
                                <ul>
                                    <li class="flex items-center justify-start text-md p-1 cursor-pointer" @click="onRelationshipRemoving(relationship)">
                                        <TrashIcon class="h-5 w-5 mr-1 text-red-400" />
                                        Delete
                                    </li>
                                </ul>
                            </div>
                        </span>
                    </div>

                    <template v-if="relationship.isCommon()">
                        <CommonRelationship
                            :relationship="relationship"
                            :get-for-select="getForSelect"
                            @save="saveRelationship(relationship)"
                        />
                    </template>

                    <template v-if="relationship.isManyToMany()">
                        <ManyToManyRelationship
                            :relationship="relationship"
                            :get-for-select="getForSelect"
                            @save="saveRelationship(relationship)"
                        />
                    </template>

                    <template v-if="relationship.isMorph()">
                        <MorphRelationship
                            :relationship="relationship"
                            @save="saveRelationship(relationship)"
                        />
                    </template>

                    <template v-if="relationship.isThrough()">
                        <ThroughRelationship
                            :models="models"
                            :relationship="relationship"
                            :get-for-select="getForSelect"
                            @save="saveRelationship(relationship)"
                        />
                    </template>
                </div>

                <template v-if="relationship.relatedModelId">
                    <UiDropdownSelect
                        v-model="relationship.inverseId"
                        placeholder="Inverse Relationship (optional)"
                        :options="getRelatedModelRelationshipsForSelect(relationship)"
                        @change="saveRelationship(relationship)"
                    />
                </template>
                
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