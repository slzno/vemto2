import { createApp } from "vue"
import { createPinia } from "pinia"


import "highlight.js/styles/github-dark.css"
import "./main.css"
 
import App from "./App.vue"
import router from "./router"

import Hljs from "highlight.js/lib/core"
import HljsVuePlugin from "@highlightjs/vue-plugin"
import PhpLang from "highlight.js/lib/languages/php"
import JavascriptLang from "highlight.js/lib/languages/javascript"

Hljs.registerLanguage("php", PhpLang)
Hljs.registerLanguage("javascript", JavascriptLang)

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(HljsVuePlugin)

app.mount("#app")
