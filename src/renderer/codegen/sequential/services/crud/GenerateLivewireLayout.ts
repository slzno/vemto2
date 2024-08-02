import Project from "@Common/models/Project";
import RenderableLivewireLayout from "./livewire/RenderableLivewireLayout";

export default class GenerateLivewireLayout {
    async start(project: Project) {
        if(!project.codeGenerationSettings.livewireLayout) return;
        
        await new RenderableLivewireLayout().render()
    }
}
