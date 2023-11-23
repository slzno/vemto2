import { defineStore } from "pinia"
import Project from "@Common/models/Project"
import { useSchemaStore } from "./useSchemaStore"

export const useProjectStore = defineStore("project", {
    state: () => ({ 
        project: {} as Project,
        hasSourceChanges: false,
    }),

    actions: {
        setProject(project: Project) {
            this.project = project
        },

        reloadProject() {
            if(!this.project.id) return

            const currentProject = this.project

            // Reset project to empty. This is necessary because if we use
            // this.project.fresh(), it changes the instance of the project
            // and its relationships, which breaks some things. By doing this,
            // we can keep the same instance of the project and its relationships,
            // but still make the reactivity detect the changes
            this.project = null

            // reload project
            this.project = currentProject
        },

        setHasSourceChanges(hasSourceChanges: boolean) {
            this.hasSourceChanges = hasSourceChanges
        },

        closeProject() {
            const schemaStore = useSchemaStore()
            
            this.project = {} as Project
            schemaStore.deselectTable()
        },
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
