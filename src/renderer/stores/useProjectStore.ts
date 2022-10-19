import { defineStore } from "pinia"
import Project from "@Common/models/Project"

export const useProjectStore = defineStore("project", {
    state: () => ({ 
        project: {} as Project,
    }),

    actions: {
        setProject(project: Project) {
            this.project = project
        },
    },

    getters: {
        projectIsEmpty(state) {
            return state.project.id === undefined
        }
    }
})
