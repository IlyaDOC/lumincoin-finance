import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {CommonRequests} from "../services/common-requests.js";

export class Expenses {
    constructor() {
        this.editButtons = document.querySelectorAll('.expanses .categories .category .category-buttons .edit');
        this.addButton = document.getElementById('add');


        if (this.addButton) {
            this.addButton.addEventListener('click', ()=> {
                location.href = '#/expenses/create';
            });
        }


        this.init('expense');
    }

    async init(path) {
        if (location.hash === '#/expenses') {
            await CommonRequests.getCategories(path);
            await CommonRequests.deleteCategory(path);
        }

        if (location.hash !== '#/income' && location.hash !== '#/expenses'
            && location.hash !== '#/income/create' && location.hash !== '#/expenses/create') {
            await CommonRequests.editCategory(path);
        }

        if (location.hash === '#/expenses/create') {
           await CommonRequests.addCategory(path);
        }
    };


}