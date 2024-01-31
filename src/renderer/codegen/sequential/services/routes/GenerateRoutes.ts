import Routes from "./Routes"
import Route from "@Common/models/Route"
import Project from "@Common/models/Project"
import Main from "@Renderer/services/wrappers/Main"
import GenerateBootstrapApp from "./GenerateBootstrapApp"
import { RenderableFileType } from "@Common/models/RenderableFile"

export default class GenerateRoutes {
    async start(project: Project) {
        const routes = Route.get()

        await new Routes(routes).render()

        if(project.laravelVersionLessThan('11.0')) {
            await this.addRoutesToRouteServiceProvider()
        } else {
            await new GenerateBootstrapApp().start()
        }
    }

    async addRoutesToRouteServiceProvider() {
        const routesContent = "\n            Route::middleware('web')\n                ->group(base_path('routes/app.php'));"

        let providerContent = await Main.API.readProjectFile('app/Providers/RouteServiceProvider.php')

        if(providerContent.includes("base_path('routes/app.php')")) return

        // get $this->routes(function () { and its content and add app.php to the end of it
        const routesFunctionRegex = /\$this->routes\(function \(\) \{([\s\S]*?)\}\);/gm
        const routesFunctionMatches = providerContent.match(routesFunctionRegex)

        if(!routesFunctionMatches) return

        // add routesContent to the end of the routes function, before the closing bracket and parenthesis - });
        const routesFunctionContent = routesFunctionMatches[0]
        const routesFunctionContentWithNewRoutes = routesFunctionContent.replace("});", routesContent + "\n        });")

        providerContent = providerContent.replace(routesFunctionRegex, routesFunctionContentWithNewRoutes)

        await Main.API.writeProjectFile('app/Providers/RouteServiceProvider.php', providerContent)

        const project = Project.find(1)
        const file = project.registerRenderableFile(
            'app/Providers', 
            'RouteServiceProvider.php',
            'NoTemplate', 
            RenderableFileType.PHP,
        )

        file.setContent(providerContent)
        file.setAsNotRemovable()
        file.save()
    }
}
