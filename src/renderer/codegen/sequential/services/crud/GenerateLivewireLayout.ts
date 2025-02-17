import Project from "@Common/models/Project";
import LivewireLayoutRenderable from "./livewire/LivewireLayoutRenderable";

export default class GenerateLivewireLayout {
    async start(project: Project) {
        if(!project.codeGenerationSettings.livewireLayout) return;
        
        await new LivewireLayoutRenderable().render()
    }
}
