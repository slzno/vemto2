import { createRouter, createWebHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProjectMainView from "../views/ProjectMainView.vue"
import ProjectSchemaView from "../views/ProjectSchemaView.vue"
import ProjectCodeQueueView from "../views/ProjectCodeQueueView.vue"
import ProjectAppsView from "../views/ProjectAppsView.vue"

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
                    path: "code-queue",
                    name: "project-code-queue",
                    component: ProjectCodeQueueView,
                },
            ],
        },
    ],
})

export default router
