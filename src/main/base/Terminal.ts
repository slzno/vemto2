import child_process from 'child_process'

export default class Terminal {

    static async open(path: string) {
        const isMacOs = process.platform === "darwin",
            isLinux = process.platform === "linux"
            
        if (isMacOs) {
            await Terminal.executeCommand(`osascript -e 'tell application "Terminal"' -e 'activate' -e 'do script "cd ${path}" in window 1' -e 'end tell'`)
        } else {
            const fullCommand = `cd ${path};`,
                commandToExecute = fullCommand.replace(/;/g, '\\;')
            
            await Terminal.executeCommand(`start wt.exe -w 0 -d . -p "PowerShell" powershell.exe -NoExit -Command "${commandToExecute}"`)
        }
    }

    static async executeCommand(command) {
        console.log('Executing: ' + command)
        
        return new Promise((resolve, reject) => {
            child_process.exec(command, (error, out, err) => {
                if(error) {
                    console.error(error)
                    reject(error)
                }
                
                if(err) {
                    console.error(err)
                    reject(err)
                }
    
                if(out) console.log(out)
    
                resolve(true)
            })
        })
    
    }

}