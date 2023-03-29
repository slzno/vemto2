import path from "path"
import { exec } from "child_process"
import Alert from "@Renderer/components/utils/Alert"

export default class CommandExecutor {

    static executeOnPath(executionPath: string, command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                exec(command, {
                    cwd: path.join("", executionPath),
                }, (error, stdout, stderr) => {
                    if(stdout.includes("VEMTO_ERROR_START")) {
                        Alert.error("(vemto error) FAILED to execute command: " + command)
                        console.error("(vemto error) FAILED to execute command: " + command)
                        console.error(stderr)
                        reject(this.parseErrorData(stdout))
                    }

                    if(stdout.includes("Warning:")) {
                        Alert.warning("(stderr) WARNING when executing command: " + command)
                        console.error("(stderr) WARNING when executing command: " + command)
                        console.error(stdout)
                    }
                    
                    if (stderr) {
                        Alert.error("(stderr) FAILED to execute command: " + command)
                        console.error("(stderr) FAILED to execute command: " + command)
                        console.error(stderr)
                        reject(stderr)
                    }

                    if (error) { 
                        Alert.error("(error) FAILED to execute command: " + command)
                        console.error("(error) FAILED to execute command: " + command)
                        console.log(stdout)
                        console.error(error)
                        reject(error)
                    }
        
                    resolve(this.parseJsonData(stdout))
                })
            } catch (error) {
                Alert.error("(execution error) FAILED to execute command: " + command)
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

}