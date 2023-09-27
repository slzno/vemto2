<script setup lang="ts">
    import Nav from '@Common/models/Nav';
    import UiText from '@Renderer/components/ui/UiText.vue';
    import UiButton from '@Renderer/components/ui/UiButton.vue';
    import UiSelect from '@Renderer/components/ui/UiSelect.vue';
    import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue';
    import { useProjectStore } from "@Renderer/stores/useProjectStore";
    import { defineProps, PropType, toRef, Ref, ref, onMounted, defineEmits } from 'vue';
    import { ChevronDoubleRightIcon, Bars4Icon } from '@heroicons/vue/24/outline'

    const props = defineProps({
            nav: {
                type: Object as PropType<Nav>,
                required: true,
            },
            isChildren: {
                type: Boolean,
                required: false,
                default: false,
            },
            editingNavigation: {
                type: Object as PropType<Nav | null>,
                required: true,
            },
        }),
        nav = toRef(props, 'nav') as Ref<Nav | null>,
        projectStore = useProjectStore(),
        navigations = ref<Nav[]>([]),
        emit = defineEmits(['childrenNavigationUpdated', 'editNavigation', 'saveNavigation', 'cancelEditing'])

    const deleteNavigation = (navigation: Nav) => {
        if(!confirm("Are you sure you want to delete this navigation?")) return

        navigation.delete()

        emit('childrenNavigationUpdated')
    }

    onMounted(() => {
        if(!props.nav) return

        navigations.value = props.nav.children
    })
</script>

<template>
    <div
        class="mb-2"
        draggable="true"
        :id="nav.id"
    >
        <div
            @click="$emit('editNavigation', nav)"
            class="mb-2 border border-slate-700 bg-slate-850 rounded-lg p-3 hover:bg-slate-800 w-96 flex items-center"
            :class="{ 'ml-8': isChildren, 'cursor-pointer': !editingNavigation }"
        >
            <template v-if="editingNavigation?.id != nav.id">
                <component class="w-4 h-4 mr-2 text-slate-600" :is="isChildren ? ChevronDoubleRightIcon : Bars4Icon" />
                {{ nav.name }}
            </template>
            <div class="p-1 w-full" v-else>
                <UiText id="name" class="mb-3" v-model="nav.name" label="Name" />

                <div class="mb-3">
                    <UiSelect v-model="nav.navigableType" label="Navigable Type">
                        <option value="Crud">Crud</option>
                        <option value="Page">Page</option>
                    </UiSelect>
                </div>
                
                <UiCheckbox v-model="nav.isCustom" label="Custom Navigation" />

                <template v-if="nav.isCustom">
                    <UiText id="customLink" class="mt-3" v-model="nav.customLink" label="Custom Link" />
                </template>

                <div class="mt-4 flex justify-between">
                    <div class="flex space-x-2">
                        <UiButton @click.stop="deleteNavigation(nav)">Delete</UiButton>
                    </div>
                    
                    <div class="flex space-x-2">
                        <UiButton @click.stop="$emit('cancelEditing')">Cancel</UiButton>
                        <UiButton @click.stop="$emit('saveNavigation', nav)">Save</UiButton>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <template v-for="element in nav.children" :key="element.id">
                <RecursiveNav
                    :nav="element"
                    :is-children="true"
                    :editing-navigation="editingNavigation"
                    @editNavigation="$emit('editNavigation', element)"
                    @saveNavigation="$emit('saveNavigation', element)"
                    @cancelEditing="$emit('cancelEditing')"
                    @childrenNavigationUpdated="$emit('childrenNavigationUpdated')"
                />
            </template>
        </div>
    </div>
</template>