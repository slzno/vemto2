import path from "path"
import { exec } from "child_process"
import Storage from "@Main/services/Storage"

export default class CommandExecutor {

    static async executePhpOnPath(executionPath: string, command: string, plainReturn:boolean = false): Promise<string> {
        const phpPath = await Storage.get("phpPath") || "php",
            phpCommand = `${phpPath} ${command}`

        return await this.executeOnPath(executionPath, phpCommand, plainReturn)
    }

    static async executeOnPath(executionPath: string, command: string, plainReturn: boolean = false): Promise<string> {
        const isDevelopment = process.env.NODE_ENV === "development"

        if(isDevelopment) {
            console.log(`Running ${command} on ${executionPath}`)
        }

        await CommandExecutor.fixShellPathOnMacOs()

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
                        const errorMessage = "(error) FAILED to execute command: " + command

                        console.error(errorMessage)
                        console.log(stdout)
                        console.error(error)

                        let errorData = {
                            message: errorMessage,
                            error: stdout,
                            stack: stdout
                        }

                        reject(errorData)
                    }
                    
                    if (plainReturn) {
                        resolve(stdout)
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

    static async fixShellPathOnMacOs(): Promise<void> {
        if (process.platform !== "darwin") return

        let shellPath

        try {
            shellPath = (await import("shell-path")).shellPathSync()
        } catch (error) {
            shellPath = null
            console.error("Failed to import shell-path", error)
        }

        process.env.PATH = shellPath || [
            "./node_modules/.bin",
            "/.nodebrew/current/bin",
            "/usr/local/bin",
            "/usr/bin",
            "/bin",
            "/usr/sbin",
            "/sbin",
            process.env.PATH
        ].join(":")
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