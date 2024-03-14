import { defineStore } from "pinia"
import { useProjectStore } from "./useProjectStore"

interface Error {
    message: string
    stack: string,
    hasTemplateError: boolean,
    templateErrorLine: number,
    templateName: string,
    templateContent: string,
    templateLines: string[],
}

export const useErrorsStore = defineStore("errors", {
    state: () => ({ 
        errors: [] as Error[],
        lastErrorMessage: "" as String
    }),

    actions: {
        addError(error: Error) {
            console.log("Adding error", error)
            this.lastErrorMessage = error.message
            this.errors.unshift(error)
        },

        clearErrors() {
            this.lastErrorMessage = ""
            this.errors = []
        }
    },

    getters: {
        hasErrors(state): boolean {
            const projectStore = useProjectStore()

            if(!projectStore.projectIsEmpty && projectStore.project.hasCurrentSchemaError()) return true

            return state.errors.length > 0
        },
    }
})
