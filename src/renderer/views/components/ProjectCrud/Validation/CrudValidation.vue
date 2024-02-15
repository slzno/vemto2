<script lang="ts" setup>
    import Vue3TagsInput from 'vue3-tags-input';
    import Input, { InputValidationRule, InputValidationRuleType } from '@Common/models/crud/Input';
    import { defineProps, toRef, onMounted, ref } from 'vue';
    import ValidationTypes from '@Common/models/static/ValidationTypes';
    import Main from '@Renderer/services/wrappers/Main';
    import { v4 as uuid } from "uuid"

    const props = defineProps(['crud']),
        crud = toRef(props, 'crud'),
        validationTypes = ValidationTypes.get(),
        creationRuleInputs = ref({}),
        updateRuleInputs = ref({});

    const fillInputRulesValue = () => {
        crud.value.inputs.forEach((input: Input) => {
            creationRuleInputs.value[input.id] = ''
            updateRuleInputs.value[input.id] = ''
        })
    }

    const tagsFromValidation = (input: Input, type: string = 'creationRules') => {
        let validation = input[type]

        if (!validation) return []

        validation = Object.values(validation)
            .map((rule: any) => {
                return {
                    id: uuid(),
                    value: rule.value
                }
            })

        return validation.filter((item: any) => item.value.length > 0)
    }

    const openURL = (url: string) => {
        Main.API.openURL(url)
    }

    const saveCreationRules = (rules: any, input: Input) => {
        creationRuleInputs.value[input.id] = ''
        saveRules(rules, input)
    }

    const saveUpdateRules = (rules: any, input: Input) => {
        updateRuleInputs.value[input.id] = ''
        saveRules(rules, input, 'updateRules')
    }

    const saveRules = (rules: any, input: Input, type: string = 'creationRules') => {
        input[type] = []

        rules.forEach((rule: any) => {
            input[type].push(
                { type: InputValidationRuleType.TEXTUAL, value: rule.value } as InputValidationRule
            )
        })

        input.save()
    }

    const filteredCreationValidations = (input: Input) => {
        return filteredValidations(input, input.creationRules, creationRuleInputs.value[input.id])
    }

    const filteredUpdateValidations = (input: Input) => {
        return filteredValidations(input, input.updateRules, updateRuleInputs.value[input.id])
    }

    const filteredValidations = (input: Input, inputRulesProperty: any, inputValue: any) => {
        const types = inputRulesProperty.map(
            (rule: any) => rule.value
        )

        const validations = validationTypes.filter((item: any) => !types.includes(item.text))

        if(!inputValue?.length) return validations

        return validations.filter((item: any) => item.text && item.text.includes(inputValue))
    }

    const saveCreationSelectedRule = (rule: any, input: Input) => {
        creationRuleInputs.value[input.id] = ''
        saveSelectedRule(rule, input)
    }

    const saveUpdateSelectedRule = (rule: any, input: Input) => {
        updateRuleInputs.value[input.id] = ''
        saveSelectedRule(rule, input, 'updateRules')
    }

    const saveSelectedRule = (rule: any, input: Input, type: string = 'creationRules') => {
        input[type].push(
            { type: InputValidationRuleType.TEXTUAL, value: rule.text } as InputValidationRule
        )

        input.save()
    }

    const saveCreationRuleUpdatedManually = (event: any, index: number, input: Input) => {
        saveRuleUpdatedManually(event, index, input, input.creationRules)
    }

    const saveUpdateRuleUpdatedManually = (event: any, index: number, input: Input) => {
        saveRuleUpdatedManually(event, index, input, input.updateRules)
    }

    const saveRuleUpdatedManually = (event: any, index: number, input: Input, inputRulesProperty: any) => {
        const value = event.target.innerText

        if (value.length === 0) {
            inputRulesProperty.splice(index, 1)
            input.save()
        }

        inputRulesProperty[index] = { type: InputValidationRuleType.TEXTUAL, value } as InputValidationRule
        input.save()
    }

    onMounted(() => {
        fillInputRulesValue()
    })
</script>

<template>
    <div class="p-4">
        <table>
            <thead>
                <tr>
                    <th class="font-normal text-lg text-slate-950 dark:text-slate-300 pb-4 text-right px-4"></th>
                    <th class="font-normal text-lg text-slate-950 dark:text-slate-300 pb-4">Creation Validation</th>
                    <th class="font-normal text-lg text-slate-950 dark:text-slate-300 pb-4">Update Validation</th>
                </tr>
            </thead>

            <tbody>
                <tr class="hover:bg-slate-300 dark:hover:bg-slate-850 group" v-for="input in crud.inputs" :key="input.id">
                    <td class="px-4 py-3 text-right group-hover:text-red-500">
                        <div class="w-full bg-slate-800 py-1 pl-2 pr-6 rounded-r-full border border-slate-700">
                            {{ input.name }}
                        </div>
                    </td>
                    <td class="px-4 w-2/4">
                        <div>
                            <Vue3TagsInput
                                :add-tag-on-blur="true"
                                :duplicate-select-item="false"
                                :select="true"
                                placeholder="Add validation rule"
                                class="flex dark:text-slate-200 dark:!bg-slate-950 dark:!border-slate-650 dark:!shadow-none"
                                :tags="tagsFromValidation(input)"
                                @onTagsChanged="saveCreationRules($event, input)"
                                :select-items="filteredCreationValidations(input)"
                                @onSelect="saveCreationSelectedRule($event, input)"
                                v-model="creationRuleInputs[input.id]"
                            >
                                <template #item="{ tag, index }">
                                    <span
                                        contenteditable="true"
                                        @click.stop
                                        class="bg-transparent"
                                        spellcheck="false"
                                        @input="saveCreationRuleUpdatedManually($event, index, input)"
                                    >{{ tag.value }}</span>
                                </template>
                                
                                <template #select-item="item">
                                    <div>
                                        <div class="text-xl dark:text-slate-200">{{ item.text }}</div>
                                        <div class="text-sm dark:text-slate-400" v-if="item.description">{{ item.description }}</div>
                                        <div class="text-sm">
                                            <a :href="item.link" class="underline text-red-500" @click.prevent.stop="openURL(item.link)">See more</a>
                                        </div>
                                    </div>
                                </template>
                            </Vue3TagsInput>
                        </div>
                    </td>
                    <td class="px-4 w-2/4">
                        <Vue3TagsInput
                            :add-tag-on-blur="true"
                            :duplicate-select-item="false"
                            :select="true"
                            placeholder="Add validation rule"
                            class="flex dark:text-slate-200 dark:!bg-slate-950 dark:!border-slate-650 dark:!shadow-none"
                            :tags="tagsFromValidation(input, 'updateRules')"
                            @onTagsChanged="saveUpdateRules($event, input)"
                            :select-items="filteredUpdateValidations(input)"
                            @onSelect="saveUpdateSelectedRule($event, input)"
                            v-model="updateRuleInputs[input.id]"
                        >
                            <template #item="{ tag, index }">
                                <span
                                    contenteditable="true"
                                    @click.stop
                                    class="bg-transparent"
                                    spellcheck="false"
                                    @input="saveUpdateRuleUpdatedManually($event, index, input)"
                                >{{ tag.value }}</span>
                            </template>
                            
                            <template #select-item="item">
                                <div>
                                    <div class="text-xl dark:text-slate-200">{{ item.text }}</div>
                                    <div class="text-sm dark:text-slate-400" v-if="item.description">{{ item.description }}</div>
                                    <div class="text-sm">
                                        <a :href="item.link" class="underline text-red-500" @click.prevent.stop="openURL(item.link)">See more</a>
                                    </div>
                                </div>
                            </template>
                        </Vue3TagsInput>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="postcss">
.v3ti {
    @apply rounded-lg;
    @apply p-[0.05rem];
}

.v3ti .v3ti-tag {
    @apply text-slate-300;
    @apply border border-slate-700;
    @apply bg-slate-800;
    @apply rounded-md;
    @apply pl-2;
    @apply font-thin;
}

.v3ti .v3ti-tag .v3ti-remove-tag {
    color: #222;
    transition: color .3s;
}

.v3ti .v3ti-tag span {
    @apply outline-none;
    @apply px-2;
    @apply border border-transparent;
    @apply rounded;
}

.v3ti .v3ti-tag span:focus {
    @apply border-red-500;
}

.v3ti .v3ti-tag .v3ti-remove-tag {
    @apply text-red-500;
    @apply pl-2;
}

.v3ti .v3ti-tag .v3ti-remove-tag:hover {
    @apply text-red-500;
}

.v3ti .v3ti-new-tag::placeholder {
    @apply font-thin;
    @apply text-slate-400 dark:text-slate-500;
}

.v3ti-context-menu {
    background: #1e293b !important; /* bg-slate-800 */
    max-height: 300px !important;
}

.v3ti .v3ti-context-menu .v3ti-context-item:hover {
    background: #334155 !important; /* bg-slate-700 */
}
</style>