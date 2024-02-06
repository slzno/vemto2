import RenderableLivewireLayout from "./livewire/RenderableLivewireLayout";

export default class GenerateLivewireLayout {
    async start() {
        await new RenderableLivewireLayout().render()
    }
}
