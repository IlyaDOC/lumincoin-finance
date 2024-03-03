import {Diagrams} from "./diagrams.js";
import {CommonRequests} from "../services/common-requests.js";


export class Main {
    constructor() {
        this.sidebarElement = document.getElementById('sidebar');
        this.sidebarElement.style.display = 'block';
        this.mainListItem = document.getElementById('main');
        this.activeStyleOnLoad();
        this.diagrams = new Diagrams();

        CommonRequests.getOperationsWithFilter(this.diagrams.income, this.diagrams.expense);

        this.init();
    }

    activeStyleOnLoad() {
        this.mainListItem.classList.add('active');
    };

    async init() {
        await CommonRequests.getOperationsDefault(this.diagrams.income, this.diagrams.expense);
    }
}