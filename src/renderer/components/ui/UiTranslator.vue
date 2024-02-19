<script setup lang="ts">
    import UiText from "./UiText.vue"
    import UiModal from "./UiModal.vue"
    import UiLockableText from "./UiLockableText.vue"
    import { GlobeAltIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { ref, defineProps, defineEmits, computed, onMounted } from "vue"

    const props = defineProps({
        modelValue: {
            type: String,
            required: true,
        },

        label: {
            type: String,
        },

        placeholder: {
            type: String,
        },

        disabled: {
            type: Boolean,
            default: false,
        },

        id: {
            type: String,
            default: "",
        },
        
        inlineLabel: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits(["update:modelValue", "input", "blur", "focus"]),
        localValue = computed({
            get(): any {
                return props.modelValue
            },
            
            set(value: any): void {
                emit('update:modelValue', value)
                emit('input', value)
            },
        })

    const showingModal = ref(false),
        currentLanguage = ref("en"),
        currentLanguageValue = ref(""),
        translations = ref({}),
        languages = ref([])

    const projectStore = useProjectStore()
    
    onMounted(() => {
        languages.value = projectStore.project.languages || ["en"]

        languages.value.forEach(language => {
            translations.value[language] = projectStore.project.getTranslation(language, localValue.value)
        })

        currentLanguageValue.value = translations.value[currentLanguage.value] || ""
    })

    const saveTranslations = () => {
        languages.value.forEach(language => {
            projectStore.project.setTranslation(language, localValue.value, translations.value[language])
        })
    }

    const changeCurrentLanguageValue = () => {
        translations.value[currentLanguage.value] = currentLanguageValue.value

        saveTranslations()
    }
</script>

<template>
    <div class="flex gap-1 flex-1" :class="{ 'flex-col': !inlineLabel, 'items-center': inlineLabel }">
        <label v-if="label" class="text-xs text-slate-400">{{ label }}</label>
        <div :class="{ 'flex-1': inlineLabel }" class="flex">
            <input
                class="flex-1 border border-slate-650 border-r-transparent focus:border-red-500 dark:focus:border-red-500 dark:focus:border-r-red-500 dark:focus:text-slate-200 dark:text-slate-300 focus:ring-transparent bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg rounded-r-none disabled:opacity-60 disabled:cursor-not-allowed"
                type="text"
                :id="id"
                :placeholder="placeholder"
                v-model="currentLanguageValue"
                @blur="$emit('blur', localValue)"
                @focus="$emit('focus', localValue)"
                @change="changeCurrentLanguageValue"
                spellcheck="false"
                autocomplete="false"
                :disabled="disabled"
            />
            <button 
                @click="showingModal = true"
                class="flex px-2 items-center bg-slate-100 dark:bg-slate-950 border border-slate-650 border-l-0 rounded-lg rounded-l-none cursor-pointer hover:text-red-500"
            >
                <GlobeAltIcon class="w-4 h-4 stroke-2" />
            </button>

            <UiModal
                width="700px"
                height="600px"
                title="Translation Manager"
                :show="showingModal"
                @close="showingModal = false"
            >
                <div class="p-4">
                    <div class="m-1 flex flex-col gap-4">
                        <div class="flex space-x-1">
                            <div class="w-2/3">
                                <UiLockableText label="Key" v-model="localValue" />
                            </div>
                            <div class="w-1/3">
                                <!-- <UiSelect
                                    v-model="projectStore.project.defaultLanguage"
                                    label="Default Language"
                                    placeholder="Select a language"
                                    @change="projectStore.project.save()">
                                    <option v-for="language in projectStore.project.languages" :key="language" :value="language">{{ language }}</option>
                                </UiSelect> -->
                            </div>
                        </div>
                        <div class="mt-4">
                            <table class="w-full">
                                <tbody>
                                    <tr v-for="language in languages">
                                        <td class="text-right p-2 w-1/6">{{ language }}</td>
                                        <td>
                                            <UiText v-model="translations[language]" @change="saveTranslations" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </UiModal>
        </div>
    </div>
</template>
