class TextUtil {

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

    getSurroundingLinesFromContent(content: string, fromLine = 1, extraLines = 6) {
        let lines = content.split('\n'),
            finalLines = [],    
            initialLine = 0

        if(fromLine <= 0 || fromLine > lines.length) throw new Error('Please define a valid content line number')
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