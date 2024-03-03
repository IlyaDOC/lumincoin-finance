import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";
import {CommonRequests} from "../services/common-requests.js";

export class Income {
    constructor() {
        this.addButton = document.getElementById('add');


        if (this.addButton) {
            this.addButton.addEventListener('click', () => {
                location.href = '#/income/create';
            });
        }


        this.init('income');
    }
    async init(path) {
        if (location.hash === '#/income') {
            await CommonRequests.getCategories(path);
            await CommonRequests.deleteCategory(path);
        }
        if (location.hash !== '#/income' && location.hash !== '#/expenses'
            && location.hash !== '#/income/create' && location.hash !== '#/expenses/create') {
            await CommonRequests.editCategory(path);
        }

        if (location.hash === '#/income/create') {
            await CommonRequests.addCategory(path);
        }
    };
}