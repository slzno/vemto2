import path from "path"
import { app } from "electron"
import { exec } from "child_process"

export default class ReadProjectSchema {

    static run(projectPath: string) {
        return new Promise((resolve, reject) => {
            let apiFilePath = path.join(app.getAppPath(), "static", "schema-reader.phar")
    
            let command = `php ${apiFilePath}`

            console.log(`Executing: ${command}`)
    
            exec(command, {
                cwd: path.join("", projectPath),
            }, (error, stdout, stderr) => {
                if (error) { 
                    console.error(error)
                    reject(error)
                }
                
                if (stderr) {
                    console.error(stderr)
                    reject(stderr)
                }

                if(stdout.includes("VEMTO_ERROR_START")) {
                    console.error(stderr)
                    reject(this.parseErrorData(stdout))
                }
    
                resolve(this.parseJsonData(stdout))
            })
        })
    }

    static parseJsonData(data: string): any {
        let matches = data.match(/VEMTO_JSON_RESPONSE_START\((.*)\)VEMTO_JSON_RESPONSE_END/)
        
        if (matches && matches[1]) {
            return JSON.parse(matches[1])
        }

        return {}
    }

    static parseErrorData(data: string): any {
        let matches = data.match(/VEMTO_ERROR_START\((.*)\)VEMTO_ERROR_END/)
        
        if (matches && matches[1]) {
            return matches[1]
        }

        return 'Unknown Error'
    }

}
