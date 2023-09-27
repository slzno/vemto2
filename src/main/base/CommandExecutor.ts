import path from "path"
import { exec } from "child_process"

export default class CommandExecutor {

    static executeOnPath(executionPath: string, command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                exec(command, {
                    cwd: path.join("", executionPath),
                }, (error, stdout, stderr) => {
                    if(stdout.includes("VEMTO_ERROR_START")) {
                        console.error("(vemto error) FAILED to execute command: " + command)
                        console.error(stderr)

                        let errorMessage = this.parseErrorData(stdout),
                            errorStack = this.parseErrorStack(stdout)

                        console.log(errorStack)

                        let error = {
                            error: errorMessage,
                            message: errorMessage,
                            stack: errorStack
                        }

                        reject(error)
                    }

                    if(stdout.includes("Warning:")) {
                        console.error("(stderr) WARNING when executing command: " + command)
                        console.error(stdout)
                    }
                    
                    // We need to check for "Loaded config default." because PHP CS Fixer outputs this to stderr,
                    // instead of stdout, for some reason. There is a closed issue on their repo about this.
                    // https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/issues/3725
                    if (stderr && !stderr.includes("Loaded config default")) {
                        let errorMessage = "(stderr) FAILED to execute command: " + command + "\n\n" + stderr

                        console.error(errorMessage)

                        console.error(stderr)
                        console.error("Error: " + error)
                        console.error("Stdout: " + stdout)

                        let errorData = {
                            error: errorMessage,
                            message: errorMessage,
                            stack: null
                        }

                        reject(errorData)
                    }

                    if (error) { 
                        console.error("(error) FAILED to execute command: " + command)
                        console.log(stdout)
                        console.error(error)
                        reject(error)
                    }
        
                    resolve(this.parseJsonData(stdout))
                })
            } catch (error) {
                console.error("(execution error) FAILED to execute command: " + command)
                console.error(error)
                reject(error)
            }

        })
    }

    static parseJsonData(data: string): any {
        const matches = data.match(/VEMTO_JSON_RESPONSE_START\((.*)\)VEMTO_JSON_RESPONSE_END/)
        
        if (matches && matches[1]) {
            return JSON.parse(matches[1])
        }

        return {}
    }

    static parseErrorData(data: string): any {
        const matches = data.match(/VEMTO_ERROR_START\((.*)\)VEMTO_ERROR_END/)
        
        if (matches && matches[1]) {
            return matches[1]
        }

        return 'Unknown Error'
    }


    static parseErrorStack(data: string): any {
        // modify above to support multiple lines
        const matches = data.match(/VEMTO_ERROR_TRACE_START\(([\s\S]*)\)VEMTO_ERROR_TRACE_END/)
        
        if (matches && matches[1]) {
            return matches[1]
        }

        return 'Unknown Error Stack'
    }
}