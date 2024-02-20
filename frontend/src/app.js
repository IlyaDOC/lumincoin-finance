import {Router} from "./router.js";
import {Navbar} from "./components/navbar.js";

class App {
    constructor() {
        this.router = new Router();
        new Navbar();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));
    }

    handleRouteChanging () {
        this.router.openRoute();
    };
}

(new App());