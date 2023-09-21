import { defineStore } from "pinia"
import Project from "@Common/models/Project"

export const useProjectStore = defineStore("project", {
    state: () => ({ 
        project: {} as Project
    }),

    actions: {
        setProject(project: Project) {
            this.project = project
        },

        reloadProject() {
            if(!this.project.id) return

            this.project = this.project.fresh()
        }
    },

    getters: {
        projectIsEmpty(state): boolean {
            return state.project.id === undefined
        },

        projectIsReady(state): boolean {
            return state.project.id !== undefined
        },

        hasRenderableFilesWithConflict(state): boolean {
            if(!state.project.id) return false
            
            return state.project.hasRenderableFilesWithConflict()
        },

        hasSchemaChanges(state): boolean {
            if(!state.project.id) return false
            
            return state.project.hasSchemaChanges()
        },
    }
})
