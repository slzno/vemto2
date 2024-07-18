<script setup lang="ts">
    import { ref, Ref, onMounted, nextTick } from "vue";
    import { capitalCase } from "change-case";
    import UiText from "@Renderer/components/ui/UiText.vue";
    import Route, { RouteType } from "@Common/models/Route";
    import UiButton from "@Renderer/components/ui/UiButton.vue";
    import UiModal from "@Renderer/components/ui/UiModal.vue";
    import UiSelect from "@Renderer/components/ui/UiSelect.vue";
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { PlusIcon } from "@heroicons/vue/24/outline";

    const projectStore = useProjectStore(),
        activeRoute = ref<Route|null>(null),
        selectedRoutable = ref(null),
        showingCreateRouteModal = ref<boolean>(false),
        routes = ref([]) as Ref<Route[]>

    const routableData = ref(null),
        routeMethod = ref<string | null>("get"),
        routeName = ref<string | null>(null),
        routePath = ref<string | null>(null),
        routeTag = ref<string | null>(null)

    onMounted(() => {
        loadRoutes()
    })

    const loadRoutes = () => {
        setTimeout(() => {
            routes.value = projectStore.project.routes
        }, 100)
    }

    const onRouteClick = (route: Route) => {
        if(activeRoute.value?.id == route.id) return

        cancel()

        activeRoute.value = route

        selectedRoutable.value = {
            id: route.routableId,
            type: route.routableType
        }
    }

    const saveRoute = () => {
        if(!activeRoute.value) return

        activeRoute.value.type = activeRoute.value.type as RouteType

        if(selectedRoutable.value) {
            activeRoute.value.routableId = selectedRoutable.value.id
            activeRoute.value.routableType = selectedRoutable.value.type
        }

        activeRoute.value.save()

        cancel()
    }

    const getRouteTypes = () => {
        return Object.entries(RouteType).map(key => {
            return {
                label: key[0],
                value: key[1]
            }
        })
    }

    const getProjectApps = () => {
        return projectStore.project.getApplications()
    }

    const getProjectAppsExceptFilament = () => {
        return projectStore.project.getApplications().filter(app => app.getAppSubType() != "FILAMENT")
    }

    const cancel = () => {
        activeRoute.value = null
        selectedRoutable.value = null
    }

    const deleteRoute = async (route: Route) => {
        const confirmed = await window.projectConfirm("Are you sure you want to delete this route?")

        if(!confirmed) return

        route.delete()

        routes.value = routes.value.filter(r => r.id != route.id)

        cancel()
    }

    const close = (clearData: boolean = false) => {
        showingCreateRouteModal.value = false

        if(clearData) {
            routeName.value = null
            routePath.value = null
            routeMethod.value = 'get'
            routableData.value = null
            routeTag.value = null
        }
    }

    const onApplicationChanged = () => {
        if(!routableData.value) return

        const app = projectStore.project.getApplicationById(routableData.value.id)

        if(!app) return

        routePath.value = app.getBaseRoutePath()
        routeName.value = `${app.getBaseRouteName()}.`

        nextTick(() => {
            document.querySelector("#create-route-name-input")?.focus()
        })
    }

    const createRoute = () => {
        if(!routeName.value || !routePath.value || !routeMethod.value || !routableData.value || !routeTag.value) return

        const app = projectStore.project.getApplicationById(routableData.value.id)

        if(!app) return

        const route = new Route({
            name: routeName.value,
            tag: routeTag.value,
            method: routeMethod.value,
            type: RouteType.ROUTE,
            path: routePath.value,
            routableId: app.id,
            routableType: routableData.value.type,
            projectId: projectStore.project.id,
        })

        route.save()

        routes.value.push(route)

        close(true)
    }
</script>

<template>
    <div class="mb-3">
        <UiButton @click="showingCreateRouteModal = true">
            <PlusIcon class="w-4 h-4 mr-1 text-red-500" />
            Add Route
        </UiButton>
    </div>

    <UiModal
        title="Add Route"
        :show="showingCreateRouteModal"
        @close="close()"
        width="25%"
    >
        <div class="m-2">
            <div class="m-1 flex flex-col gap-2">
                <UiSelect v-model="routableData" label="Application" @change="onApplicationChanged">
                    <option
                        v-for="app in getProjectAppsExceptFilament()"
                        :key="app.id"
                        :value="{ id: app.id, type: app.constructor.identifier() }"
                    >{{ app.getAppSubType() }}: {{ app.name }}</option>
                </UiSelect>
                
                <UiText id="create-route-name-input" v-model="routeName" label="Name" />

                <UiText v-model="routePath" label="Path" />

                <UiText v-model="routeTag" label="Tag" />

                <UiSelect v-model="routeMethod" label="Route Method">
                    <option :value="null" disabled>Select a Route Method</option>
                    <option value="get">GET</option>
                    <option value="post">POST</option>
                    <option value="put">PUT</option>
                    <option value="patch">PATCH</option>
                    <option value="delete">DELETE</option>
                </UiSelect>
            </div>

            <div class="m-1 mt-2 flex justify-end">
                <UiButton @click="createRoute()">Create</UiButton>
            </div>
        </div>
    </UiModal>

    <div class="bg-slate-950 p-3 rounded-lg border border-slate-700 h-screen overflow-y-auto pb-48">
        <div
            class="w-2/3 mb-2 border border-slate-700 bg-slate-850 rounded-lg p-3 hover:bg-slate-800 flex flex-col gap-3"
            v-for="route in routes"
            @click="onRouteClick(route)"
            :key="route.id"
        >
            <div class="cursor-pointer w-full flex justify-between items-start">
                <div>
                    <div class="mt-2 space-x-3 font-mono">
                        <span
                            class="px-2 py-0.5 bg-green-300 text-green-700 rounded"
                            >{{ route.method.toUpperCase() }}</span
                        >
                        <span>{{ route.path }}</span>
                    </div>
                </div>
        
                <div class="space-x-2">
                    <div title="Api Route" v-if="route.isApiRoute()" class="rounded px-1 py-1 bg-slate-700 inline-block text-xs">
                        API
                    </div>
                    <div class="rounded px-2 py-1 bg-slate-800 inline-block text-sm">
                        {{ route.getName() }}
                    </div>
                </div>
            </div>

            <div v-if="activeRoute?.id === route.id">
                <div class="flex justify-between gap-3">
                    <UiText class="mb-3" v-model="activeRoute.name" label="Name" />
                    <UiText class="mb-3" v-model="activeRoute.tag" label="Tag" />
                </div>

                <div class="mb-3 flex flex-col gap-1">
                    <UiSelect v-model="activeRoute.method" label="Method">
                        <option value="get">GET</option>
                        <option value="post">POST</option>
                        <option value="put">PUT</option>
                        <option value="patch">PATCH</option>
                        <option value="delete">DELETE</option>
                    </UiSelect>
                </div>

                <UiText class="mb-3" v-model="activeRoute.path" label="Path" />

                <div class="mb-3 flex flex-col gap-1">
                    <UiSelect v-model="activeRoute.type" label="Type">
                        <option
                            v-for="routeType in getRouteTypes()"
                            :key="routeType.value"
                            :value="routeType.value"
                        >{{ capitalCase(routeType.label) }}</option>
                    </UiSelect>
                </div>

                <div class="mb-3 flex flex-col gap-1">
                    <UiSelect v-model="selectedRoutable" label="Application">
                        <option
                            v-for="app in getProjectApps()"
                            :key="app.id"
                            :value="{ id: app.id, type: app.constructor.identifier() }"
                        >{{ app.getAppSubType() }}: {{ app.name }}</option>
                    </UiSelect>
                </div>

                <div class="mt-4 flex justify-between">
                    <div class="flex space-x-2">
                        <UiButton @click.stop="deleteRoute(route)">Delete</UiButton>
                    </div>
                    
                    <div class="flex space-x-2">
                        <UiButton @click.stop="cancel()">Cancel</UiButton>
                        <UiButton @click.stop="saveRoute()">Save</UiButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
