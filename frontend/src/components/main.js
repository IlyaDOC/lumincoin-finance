import {Diagrams} from "./diagrams.js";


export class Main {
    constructor() {
        this.sidebarElement = document.getElementById('sidebar');
        this.sidebarElement.style.display = 'block';
        this.mainListItem = document.getElementById('main');
        this.activeStyleOnLoad();
        new Diagrams();
    }

    activeStyleOnLoad() {
        this.mainListItem.classList.add('active');
    };
}