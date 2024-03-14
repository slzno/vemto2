class TextUtil {

    /**
     * Removes all spaces, tabs and line breaks from a string
     * @param string text 
     * @returns string
     */
    absolute(text: string) {
        return text.replace(/\s/g, '')
    }

    random(size = 32) {
        let result = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        const charactersLength = characters.length
        
        let counter = 0

        while (counter < size) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength))
            counter += 1
        }

        return result
    }

    capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    textBetween(content: string, start: string, end: string) {
        return content.substring(
            content.indexOf(start), 
            content.lastIndexOf(end),
        )
    }

    trimChar(str: string, ch: string) {
        var start = 0, 
            end = str.length
    
        while(start < end && str[start] === ch)
            ++start
    
        while(end > start && str[end - 1] === ch)
            --end
    
        return (start > 0 || end < str.length) ? str.substring(start, end) : str
    }

    getSurroundingLinesAsText(content: string, fromLine = 1, extraLines = 6) {
        const lines = this.getSurroundingLinesFromContent(content, fromLine, extraLines)

        return lines.map((line) => line.number + '    ' + line.content).join('\n')
    }       

    getSurroundingLinesFromContent(content: string, fromLine = 1, extraLines = 6) {
        let lines = content.split('\n'),
            finalLines = [],    
            initialLine = 0

        if(fromLine <= 0 || fromLine > lines.length) return []
        if(extraLines % 2 !== 0) throw new Error('The amount of extra lines must be an even number')

        for (let currentLine = fromLine; currentLine >= (fromLine - (extraLines / 2)); currentLine--) {
            
            let currentLineIndex = currentLine - 1

            if(lines[currentLineIndex] === undefined) break
            
            initialLine = currentLine
        }

        
        for(let currentLine = initialLine; currentLine < (initialLine + (extraLines + 1)); currentLine++) {
            
            let currentLineIndex = currentLine - 1

            if(lines[currentLineIndex] === undefined) break
            
            finalLines.push({
                number: currentLine,
                content: lines[currentLineIndex]
            })
        }

        return finalLines
    }
}

export default new TextUtil