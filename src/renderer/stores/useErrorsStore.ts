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
        lastErrorMessage: "" as String,
        lastErrorTime: 0 as number,
    }),

    actions: {
        addError(error: Error) {
            error.stack = error.stack.replaceAll("VEMTO_EOL", "\n")
            
            console.log("Adding error", error)

            this.lastErrorTime = Date.now()

            if(this.lastErrorMessage === error.message) {
                // get the last error and prepend the stack if it is different
                const lastError = this.errors[0]

                if(lastError.stack !== error.stack) {
                    lastError.stack = error.stack + "\n\n--------\n\n" + lastError.stack
                }

                return
            }

            this.lastErrorMessage = error.message
            this.errors.unshift(error)
        },

        clearErrors() {
            this.lastErrorMessage = ""
            this.errors = []
        },

        report() {
            this.lastErrorTime = Date.now()
        },
    },

    getters: {
        hasErrors(state): boolean {
            const projectStore = useProjectStore()

            if(!projectStore.projectIsEmpty && projectStore.project.hasCurrentSchemaError()) return true

            return state.errors.length > 0
        },

        hasSchemaReaderErrors(state): boolean {
            const projectStore = useProjectStore()

            if(!projectStore.projectIsEmpty && projectStore.project.hasCurrentSchemaError()) return true

            return state.errors.some(error => error.message.includes("schema-reader"))
        },

        hasErrorWithText(state) {
            return (text: string) => {
                const projectStore = useProjectStore()

                let hasMatchingSchemaError = false

                if(!projectStore.projectIsEmpty && projectStore.project.hasCurrentSchemaError()) {
                    console.log("Checking schema error", text)
                    hasMatchingSchemaError = projectStore.project.currentSchemaError.includes(text)
                }

                return hasMatchingSchemaError || state.errors.some(error => error.message.includes(text))
            }
        },
    }
})
