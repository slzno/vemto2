import { defineStore } from "pinia"
import Project from "@Common/models/Project"

export const useProjectStore = defineStore("project", {
    state: () => ({ project: {} }),

    actions: {
        setProject(project: Project) {
            this.project = project
        },
    },
})
