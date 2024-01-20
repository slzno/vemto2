import FilamentInputData from "../filament/FilamentInputData"
import FilamentInputDataList from "../filament/FilamentInputDataList"
import Input from "../Input"

export default new class FillInputFilamentData {
    input: Input

    onInput(input: Input) {
        this.setInput(input)
        this.fill()
    }

    setInput(input: Input): FillInputFilamentData {
        this.input = input

        return this
    }

    fill() {
        const filamentData = FilamentInputDataList.getFromInput(this.input)

        if(!filamentData) return

        this.input.filamentData = filamentData as FilamentInputData
    }
}