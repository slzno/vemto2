import debounce from "lodash/debounce"
import { defineStore } from "pinia"
import Project from "@Common/models/Project"
import RelaDB from "@tiago_silva_pereira/reladb"
import { useSchemaStore } from "./useSchemaStore"

export const useProjectStore = defineStore("project", {
    state: () => ({ 
        project: {} as Project,
        hasSourceChanges: false,
        projectUpdatedListenerId: null as string | null,
    }),

    actions: {
        setProject(project: Project) {
            this.project = project

            if(this.projectUpdatedListenerId) {
                this.project.removeListener(this.projectUpdatedListenerId)
            }

            this.projectUpdatedListenerId = this.project.addListener('updated', debounce(() => {
                this.refreshProject()
            }, 100))
        },

        setHasSourceChanges(hasSourceChanges: boolean) {
            this.hasSourceChanges = hasSourceChanges
        },

        closeProject() {
            if(this.projectUpdatedListenerId) {
                this.project.removeListener(this.projectUpdatedListenerId)
                this.projectUpdatedListenerId = null
            }
            
            const schemaStore = useSchemaStore()
            schemaStore.deselectTable()
            
            this.project = {} as Project

        },

        refreshProject() {
            console.log("Refreshing project data")
            this.project.refresh()
        },
    },

    getters: {
        projectIsEmpty(state): boolean {
            return state.project.id === undefined
        },

        projectIsReady(state): boolean {
            return state.project.id !== undefined
        },

        renderableFilesNeedAttention(state): boolean {
            if(!state.project.id) return false
            
            return state.project.hasRenderableFilesWithConflict()
                || state.project.hasRenderableFilesWithErrors()
        },

        hasSchemaChanges(state): boolean {
            if(!state.project.id) return false
            
            return state.project.hasSchemaChanges()
        },

        getAllRowsByModelIdentifier(state) {
            return (modelIdentifier: string) => {
                const model: any = RelaDB.Resolver.db().getModel(modelIdentifier)

                if(!model) return []

                // call the static method to get all rows
                return model.get()
            }
        },

        findRowByModelIdentifier(state) {
            return (modelIdentifier: string, rowId: string) => {
                const model: any = RelaDB.Resolver.db().getModel(modelIdentifier)

                if(!model) return null

                // call the static method to get all rows
                return model.findOrFail(rowId)
            }
        }
    }
})
