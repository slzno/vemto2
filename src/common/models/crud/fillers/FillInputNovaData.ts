import Input from "../Input"
import NovaInputDataList from "../nova/NovaInputDataList"

export default new class FillInputNovaData {
    input: Input

    onInput(input: Input) {
        this.setInput(input)
        this.fill()
    }

    setInput(input: Input): FillInputNovaData {
        this.input = input

        return this
    }

    fill() {
        const inputNovaSettings = NovaInputDataList.getFromInput(this.input)

        if(!inputNovaSettings) return

        this.input.novaSettings = inputNovaSettings
    }
}