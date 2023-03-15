import { createApp } from "vue"
import { createPinia } from "pinia"

import "highlight.js/styles/base16/monokai.css"
import "./main.css"
import 'notyf/notyf.min.css'

// import diff2html css
import "diff2html/bundles/css/diff2html.min.css"
 
import App from "./App.vue"
import router from "./router"

import Hljs from "highlight.js/lib/core"
import Main from "./services/wrappers/Main"
import HljsVuePlugin from "@highlightjs/vue-plugin"
import PhpLang from "highlight.js/lib/languages/php"
import JavascriptLang from "highlight.js/lib/languages/javascript"
import HandleModelDataUpdate from "./services/HandleModelDataUpdate"

Hljs.registerLanguage("php", PhpLang)
Hljs.registerLanguage("javascript", JavascriptLang)

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(HljsVuePlugin)

app.mount("#app")

// read update:model-data messages from the main process
Main.API.onModelDataUpdated(data => {
    HandleModelDataUpdate.start(data)
})