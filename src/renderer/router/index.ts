import { createRouter, createWebHistory } from "vue-router"

import HomeView from "../views/HomeView.vue"
import ProjectMainViewVue from "../views/ProjectMainView.vue"
import ProjectSchemaViewVue from "../views/ProjectSchemaView.vue"

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
            component: ProjectMainViewVue,
            children: [
                {
                    path: "schema",
                    name: "project-schema",
                    component: ProjectSchemaViewVue,
                }
            ]
        },
    ],
})

export default router
