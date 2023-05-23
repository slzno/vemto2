<script setup lang="ts">
    import { defineProps, toRef, onMounted, ref, onBeforeUnmount } from 'vue'
    import debounce from "@Common/tools/debounce"
    import Main from "@Renderer/services/wrappers/Main"
    import Relationship from "@Renderer/../common/models/Relationship"
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import Model from "@Common/models/Model"
    import { PlusIcon } from "@heroicons/vue/24/outline"
    import RelationshipTypes from '@Common/models/static/RelationshipTypes'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import CommonRelationship from './TableRelationships/CommonRelationship.vue'
    import ManyToManyRelationship from './TableRelationships/ManyToManyRelationship.vue'
    import MorphRelationship from './TableRelationships/MorphRelationship.vue'
    import ThroughRelationship from './TableRelationships/ThroughRelationship.vue'

    const props = defineProps(['model', 'models']),
        models = toRef(props, 'models'),
        model = toRef(props, 'model'),
        relationshipIdOptions = ref(null),
        relationships = ref([])

    const getRelationshipTypesForSelect = () => {
        return RelationshipTypes.getForDropdown()
    }

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

                console.log(inverseRelationship)

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
                <!-- <UiButton @click="relationship.logDataComparison()">Log data comparison</UiButton> -->

                <template v-if="relationship.isCommon()">
                    <CommonRelationship
                        :models="models"
                        :relationship="relationship"
                        :get-for-select="getForSelect"
                        :relationship-id-options="relationshipIdOptions"
                        @save="saveRelationship(relationship)"
                        @toggle-relationship-options="toggleRelationshipOptions(relationship)"
                        @delete-relatioship="onRelationshipRemoving(relationship)"
                    />
                </template>

                <template v-if="relationship.isManyToMany()">
                    <ManyToManyRelationship
                        :models="models"
                        :relationship="relationship"
                        :get-for-select="getForSelect"
                        :relationship-id-options="relationshipIdOptions"
                        @save="saveRelationship(relationship)"
                        @toggle-relationship-options="toggleRelationshipOptions(relationship)"
                        @delete-relatioship="onRelationshipRemoving(relationship)"
                    />
                </template>

                <template v-if="relationship.isMorph()">
                    <MorphRelationship
                        :models="models"
                        :relationship="relationship"
                        :get-for-select="getForSelect"
                        :relationship-id-options="relationshipIdOptions"
                        @save="saveRelationship(relationship)"
                        @toggle-relationship-options="toggleRelationshipOptions(relationship)"
                        @delete-relatioship="onRelationshipRemoving(relationship)"
                    />
                </template>

                <template v-if="relationship.isThrough()">
                    <ThroughRelationship
                        :models="models"
                        :relationship="relationship"
                        :get-for-select="getForSelect"
                        :relationship-id-options="relationshipIdOptions"
                        @save="saveRelationship(relationship)"
                        @toggle-relationship-options="toggleRelationshipOptions(relationship)"
                        @delete-relatioship="onRelationshipRemoving(relationship)"
                    />
                </template>

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