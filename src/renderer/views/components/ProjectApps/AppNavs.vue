<script setup lang="ts">
    import { ref, onMounted } from "vue";
    import Nav from "@Common/models/Nav";
    import RecursiveNav from "./RecursiveNav.vue"
    import UiModal from "@Renderer/components/ui/UiModal.vue";
    import UiButton from "@Renderer/components/ui/UiButton.vue";
    import UiSelect from "@Renderer/components/ui/UiSelect.vue";
    import { useProjectStore } from "@Renderer/stores/useProjectStore";
    import UiText from "@Renderer/components/ui/UiText.vue";
    import GenerateBasicMenu from "@Renderer/services/project/GenerateBasicMenu";

    const projectStore = useProjectStore(),
        editingNavigation = ref<null | Nav>(null),
        showingCreateNavigationModal = ref<boolean>(false),
        navigations = ref<Nav[]>([])

    const navigableId = ref<string | null>(null),
        navigableType = ref<string | null>("Crud"),
        name = ref<string | null>(null)

    const editNavigation = (navigation: Nav) => {
        if(navigation.id === editingNavigation.value?.id) return

        editingNavigation.value = navigation
    }

    const cancelEditing = () => {
        editingNavigation.value = null
    }

    const saveNavigation = (navigation: Nav) => {
        navigation.save()

        cancelEditing()
    }

    const createNavigation = () => {
        if(!navigableId.value || !navigableType.value || !name.value) return

        Nav.createFromNavigable(
            name.value,
            projectStore.project.id,
            navigableId.value,
            navigableType.value
        )

        close()
        resetModalData()
        reloadNavigations()
    }

    const resetModalData = () => {
        name.value = null
        navigableId.value = null
        navigableType.value = 'Crud'
    }

    const close = () => {
        showingCreateNavigationModal.value = false
    }
    
    const reloadNavigations = () => {
        navigations.value = projectStore.project.getRootNavs()
    }

    const onDragStart = (event: any) => {
        event.dataTransfer.setData("text/plain", event.target.id)
    }

    const onDragEnd = (event: any) => {
        const targetId = event.dataTransfer.getData("text"),
            toId = event.target.id || event.target.parentElement.id

        if(!targetId || targetId == toId) return;

        const targetNavigation: Nav = Nav.find(targetId)

        if(!targetNavigation) return

        if(toId == 'root') {
            targetNavigation.parentNavId = null
            targetNavigation.save()

            reloadNavigations()
            return
        }

        const toNavigation = Nav.find(toId),
            realParentNavId = toNavigation.isRoot() ? toNavigation.id : toNavigation.parentNavId
        
        if(targetId == realParentNavId) return;
        
        targetNavigation.parentNavId = realParentNavId
        targetNavigation.save()

        targetNavigation.children.forEach((child: Nav) => {
            child.parentNavId = realParentNavId
            child.save()
        })

        reloadNavigations()
    }

    const createBasicNavs = () => {
        new GenerateBasicMenu(projectStore.project).handle()

        reloadNavigations()
    }

    onMounted(() => {
        reloadNavigations()
    })
</script>

<template>
    <div class="mb-3 flex gap-2">
        <UiButton @click="showingCreateNavigationModal = true">Add Menu Item</UiButton>
        <UiButton @click="createBasicNavs">Add Basic Navs</UiButton>
    </div>

    <UiModal
        title="Add Menu Item"
        :show="showingCreateNavigationModal"
        @close="close()"
        width="25%"
    >
        <div class="m-2">
            <div class="m-1 flex flex-col gap-2">
                <UiText id="navigation-name" v-model="name" label="Name" />

                <UiSelect v-model="navigableType" label="Navigable Type">
                    <option :value="null" disabled>Select a Navigable Type</option>
                    <option value="Crud">Crud</option>
                    <option value="Page">Page</option>
                </UiSelect>

                <UiSelect v-model="navigableId" label="Crud">
                    <option :value="null" disabled>Select a Crud</option>
                    <option v-for="crud in projectStore.project.cruds" :value="crud.id" :key="crud.id">{{ crud.name }}</option>
                </UiSelect>
            </div>

            <div class="m-1 mt-2 flex justify-end">
                <UiButton @click="createNavigation()">Create</UiButton>
            </div>
        </div>
    </UiModal>

    <div
        class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen"
        id="root"
        draggable="true"
        @dragstart="onDragStart"
        @drop.prevent="onDragEnd"
        @dragenter.prevent
        @dragover.prevent
    >
        <template v-for="element in navigations" :key="element.id">
            <RecursiveNav
                :nav="element"
                :editing-navigation="editingNavigation"
                @editNavigation="editNavigation"
                @cancelEditing="cancelEditing"
                @saveNavigation="saveNavigation"
                @childrenNavigationUpdated="reloadNavigations"
            />
        </template>
    </div>
</template>
