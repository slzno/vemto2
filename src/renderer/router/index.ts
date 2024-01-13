import { createRouter, createWebHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProjectMainView from "../views/ProjectMainView.vue"
import ProjectSchemaView from "../views/ProjectSchemaView.vue"
import ProjectCodeQueueView from "../views/ProjectCodeQueueView.vue"
import ProjectAppsView from "../views/ProjectAppsView.vue"
import ProjectCrudView from "../views/ProjectCrudView.vue"
import ProjectPageView from "../views/ProjectPageView.vue"
import ProjectBotView from "../views/ProjectBotView.vue"
import ProjectPluginsView from "@Renderer/views/ProjectPluginsView.vue"
import ProjectToolsView from "@Renderer/views/ProjectToolsView.vue"
import ProjectSettingsView from "@Renderer/views/ProjectSettingsView.vue"

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: HomeView,
        },

        {
            path: "/project",
            name: "project",
            component: ProjectMainView,
            children: [
                {
                    path: "schema",
                    name: "project-schema",
                    component: ProjectSchemaView,
                },

                {
                    path: "apps",
                    name: "project-apps",
                    component: ProjectAppsView,
                },

                {
                    path: "cruds/:crudId",
                    name: "project-crud",
                    component: ProjectCrudView,
                },

                {
                    path: "pages/:pageId",
                    name: "project-page",
                    component: ProjectPageView,
                },

                {
                    path: "code-queue",
                    name: "project-code-queue",
                    component: ProjectCodeQueueView,
                },

                {
                    path: "bot",
                    name: "project-bot",
                    component: ProjectBotView,
                },

                {
                    path: "plugins",
                    name: "project-plugins",
                    component: ProjectPluginsView,
                },

                {
                    path: "tools",
                    name: "project-tools",
                    component: ProjectToolsView,
                },

                {
                    path: "settings",
                    name: "project-settings",
                    component: ProjectSettingsView,
                },
            ],
        },
    ],
})

export default router
