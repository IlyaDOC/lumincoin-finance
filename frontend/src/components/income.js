import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Income {
    constructor() {
        this.editButtons = document.querySelectorAll('.income .categories .category .category-buttons .edit');
        this.editButtons.forEach(editButton => {
            editButton.addEventListener('click', () => {
                location.href = '#/income/edit';
            })
        });

        this.addButton = document.getElementById('add');
        if (this.addButton) {
            this.addButton.addEventListener('click', () => {
                location.href = '#/income/create';
            });
        }

        this.getCategories();
    }

    async getCategories() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income');
            if (result) {
                if (result.error) {
                    throw new Error(result.error)
                }
                console.log(result);
                let categoriesGridElement = document.querySelector('.categories-grid');

                result.forEach(item=> {
                    let colElement = document.createElement('div');
                    colElement.classList.add('col');
                    let categoryElement = document.createElement('div');
                    categoryElement.classList.add('category');
                    let categoryTitleElement = document.createElement('div');
                    categoryTitleElement.classList.add('category-title', 'content-title');
                    let categoryButtonsElement = document.createElement('div');
                    categoryButtonsElement.classList.add('category-buttons');
                    let editButtonElement = document.createElement('button');
                    editButtonElement.classList.add('edit', 'category-button', 'btn', 'btn-primary', 'my-btn');
                    editButtonElement.innerText = 'Редактировать';
                    let deleteButtonElement = document.createElement('button');
                    deleteButtonElement.classList.add('delete', 'category-button', 'btn', 'btn-danger', 'my-btn');
                    deleteButtonElement.innerText = 'Удалить';
                    deleteButtonElement.setAttribute('data-bs-toggle', 'modal');
                    deleteButtonElement.setAttribute('data-bs-target', '#deleteModal');
                    categoryButtonsElement.appendChild(editButtonElement);
                    categoryButtonsElement.appendChild(deleteButtonElement);
                    categoryTitleElement.innerText = item.title;
                    categoryElement.appendChild(categoryTitleElement);
                    categoryElement.appendChild(categoryButtonsElement);
                    colElement.appendChild(categoryElement);
                    categoriesGridElement.insertAdjacentElement('afterbegin', colElement);
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}