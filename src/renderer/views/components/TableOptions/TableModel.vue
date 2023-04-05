<script setup lang="ts">
    import { PropType, Ref, toRef, ref, watch, onMounted } from "vue"
    import Model from "@Common/models/Model"
    import debounce from "@Common/tools/debounce"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/vue/24/outline"

    const props = defineProps({
        model: {
            type: Object as PropType<Model>,
            required: true,
        },
    })

    const model = toRef(props, "model") as Ref<Model>,
        relationships = ref([])
    
    let models: Ref<Array<Model>> = ref([])

    onMounted((): void => {
        const project = model.value.project
        
        models.value = project.models
        relationships.value = model.value.ownRelationships
    })

    watch(() => model.value.name, () => {
        saveModel()
    })

    const newRelationship = (): void => {
        const relationship = model.value.newRelationship()
        relationships.value.push(relationship)
    }

    // debounced
    const saveModel = debounce(() => {
        model.value.saveFromInterface()
    }, 500)

    const saveRelationship = debounce((relationship) => {
        relationship.saveFromInterface()
    }, 500)
</script>

<template>
    <div
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div>
            <UiText
                v-model="model.class"
                placeholder="Model class name with namespace"
            />

            <div class="mt-4">
                <h2 class="text-slate-500 font-semibold mb-1">Relationships</h2>

                <div>
                    <div
                        class="mb-2 bg-slate-850 p-2 rounded-md space-y-1"
                        v-for="relationship in relationships"
                        :key="relationship.id"
                    >
                        <!-- <UiButton @click="relationship.logDataComparison()">Log data comparison</UiButton> -->
                        
                        <div class="flex justify-between">
                            <div class="space-x-1">
                                <div class="text-red-400 inline-block">
                                    <UiSelect 
                                        v-model="relationship.type" 
                                        @change="saveRelationship(relationship)"
                                    >
                                        <option value="BelongsTo">Belongs To</option>
                                        <option value="HasMany">Has Many</option>
                                        <option value="HasOne">Has One</option>
                                        <option value="ManyToMany">Many To Many</option>
                                        <option value="MorphMany">Morph Many</option>
                                        <option value="MorphOne">Morph One</option>
                                        <option value="MorphTo">Morph To</option>
                                        <option value="MorphToMany">Morph To Many</option>
                                    </UiSelect>
                                </div>
        
                                <!-- ui select with models related to relationship.modelId -->
                                <UiSelect 
                                    v-model="relationship.relatedModelId"
                                    @change="saveRelationship(relationship)"
                                >
                                    <option
                                        v-for="model in models"
                                        :key="model.id"
                                        :value="model.id"
                                    >
                                        {{ model.name }}
                                    </option>
                                </UiSelect>
                            </div>

                            <span>
                                <EllipsisVerticalIcon class="h-6 w-6 text-slate-400" />
                            </span>
                        </div>

                        <div>
                            <UiText
                                v-model="relationship.name"
                                placeholder="Relationship name"
                                @change="saveRelationship(relationship)"
                            />
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
        </div>
    </div>
</template>
