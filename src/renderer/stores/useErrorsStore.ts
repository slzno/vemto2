import { defineStore } from "pinia"
import { useProjectStore } from "./useProjectStore"

interface Error {
    message: string
    stack: string
}

export const useErrorsStore = defineStore("errors", {
    state: () => ({ 
        errors: [] as Error[]
    }),

    actions: {
        addError(error: Error) {
            this.errors.unshift(error)
        },

        clearErrors() {
            this.errors = []
        }
    },

    getters: {
        hasErrors(state): boolean {
            const projectStore = useProjectStore()

            if(projectStore.projectIsEmpty) return false

            const hasCurrentSchemaError = projectStore.project.hasCurrentSchemaError()

            return state.errors.length > 0 
                || hasCurrentSchemaError
        },
    }
})
