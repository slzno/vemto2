import FilamentColumnData from "../filament/FilamentColumnData"
import FilamentColumnDataList from "../filament/FilamentColumnDataList"
import FilamentInputDataList from "../filament/FilamentInputDataList"
import FilamentInputSettings from "../filament/FilamentInputSettings"
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
        const formData = FilamentInputDataList.getFromInput(this.input),
            columnData = FilamentColumnDataList.getFromInput(this.input)

        if(!formData) return

        this.input.filamentSettings = {
            formData,
            columnData,
        } as FilamentInputSettings
    }
}