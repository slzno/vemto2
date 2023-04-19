import GenerateModelFiles from "./services/model/GenerateModelFiles";

export default class SequentialGenerator {
    
    async run() {
        await (new GenerateModelFiles).start()
    }

}