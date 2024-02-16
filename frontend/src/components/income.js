import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";

export class Income {
    constructor() {
        this.routeParams = UrlManager.getQueryParams();
        this.addButton = document.getElementById('add');
        this.incomeCreateInputValue = null;
        if (this.addButton) {
            this.addButton.addEventListener('click', () => {
                location.href = '#/income/create';
            });
        }
        if (location.hash === '#/income') {
            this.getCategories();
            this.deleteCategory();
        }
        if (location.hash !== '#/income' && location.hash !== '#/expenses' && location.hash !== '#/income/create') {
            this.editCategory();
        }

        if (location.hash === '#/income/create') {
            this.addCategory();
        }
    }

    async getCategories() {
        try {
            const result = await CustomHttp.request(config.host + '/categories/income');
            if (result) {
                if (result.error) {
                    throw new Error(result.error)
                }
                let categoriesGridElement = document.querySelector('.categories-grid');

                for (let i = result.length - 1; i >= 0; i--) {
                    let colElement = document.createElement('div');
                    colElement.classList.add('col');
                    colElement.setAttribute('id', result[i].id);
                    let categoryElement = document.createElement('div');
                    categoryElement.classList.add('category');
                    let categoryTitleElement = document.createElement('div');
                    categoryTitleElement.classList.add('category-title', 'content-title');
                    let categoryButtonsElement = document.createElement('div');
                    categoryButtonsElement.classList.add('category-buttons');
                    let editButtonElement = document.createElement('a');
                    editButtonElement.classList.add('edit', 'category-button', 'btn', 'btn-primary', 'my-btn');
                    editButtonElement.setAttribute('data-id', result[i].id);
                    editButtonElement.innerText = 'Редактировать';
                    let deleteButtonElement = document.createElement('button');
                    deleteButtonElement.classList.add('delete', 'category-button', 'btn', 'btn-danger', 'my-btn');
                    deleteButtonElement.setAttribute('data-id', result[i].id);
                    deleteButtonElement.innerText = 'Удалить';
                    deleteButtonElement.setAttribute('data-bs-toggle', 'modal');
                    deleteButtonElement.setAttribute('data-bs-target', '#deleteModal');
                    categoryButtonsElement.appendChild(editButtonElement);
                    categoryButtonsElement.appendChild(deleteButtonElement);
                    categoryTitleElement.innerText = result[i].title;
                    categoryElement.appendChild(categoryTitleElement);
                    categoryElement.appendChild(categoryButtonsElement);
                    colElement.appendChild(categoryElement);
                    categoriesGridElement.insertAdjacentElement('afterbegin', colElement);
                }

                this.editProcess();
                this.deleteProcess();

            }
        } catch (error) {
            console.log(error);
        }
    };

    editProcess() {
        document.querySelectorAll('.income .categories .category-buttons .edit').forEach(buttonEdit => {
            let buttonEditId = buttonEdit.getAttribute('data-id');
            buttonEdit.addEventListener('click', () => {
                location.href = '#/income/edit?id=' + buttonEditId;
            });
        });
    }

    async editCategory() {
        let saveBtn = document.getElementById('save-btn');
        let incomeEditInput = document.getElementById('income-edit-input');
        try {
            const result = await CustomHttp.request(config.host + '/categories/income/' + this.routeParams.id);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                incomeEditInput.value = result.title;
            }

            if (incomeEditInput.value) {
                saveBtn.addEventListener('click', () => {
                    CustomHttp.request(config.host + '/categories/income/' + this.routeParams.id, 'PUT', {
                        title: incomeEditInput.value
                    })
                    location.hash = '#/income';
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    deleteProcess() {
        document.querySelectorAll('.income .categories .category-buttons .delete').forEach(buttonDelete => {
            let buttonDeleteId = buttonDelete.getAttribute('data-id');
            buttonDelete.addEventListener('click', () => {
                sessionStorage.setItem('deleteId', buttonDeleteId);
            });
        });
    }

    async deleteCategory() {
        document.getElementById('delete-button-modal').addEventListener('click', async () => {
            await CustomHttp.request(config.host + '/categories/income/' + sessionStorage.getItem('deleteId'), 'DELETE');
            document.querySelectorAll('.categories-grid .col:not(:last-child)').forEach(element => {
                element.remove();
            })
            await this.getCategories();
        })
    }

    async addCategory() {
        const incomeCreateButton = document.getElementById('income-create-button');
        const incomeCreateInput = document.getElementById('income-create-input');
        incomeCreateInput.addEventListener('input', (event) => {
            this.incomeCreateInputValue = event.target.value;
            if (!this.incomeCreateInputValue) {
                incomeCreateInput.classList.add('is-invalid');
            } else {
                if (incomeCreateInput.classList.contains('is-invalid')) {
                    incomeCreateInput.classList.remove('is-invalid')
                }
                incomeCreateInput.classList.add('is-valid');
            }
        });
        incomeCreateButton.addEventListener('click', async () => {
            try {
                if (!this.incomeCreateInputValue) {
                    incomeCreateInput.classList.add('is-invalid');
                    throw new Error('Поле не должно быть пустым')
                } else {

                    await CustomHttp.request(config.host + '/categories/income', 'POST', {
                        title: this.incomeCreateInputValue
                    });
                    location.href = '#/income'
                }
            } catch (error) {
                console.log(error);
            }

        });

        document.getElementById('income-create-cancel-button').addEventListener('click', () => {
            location.href = '#/income';
        });

    }
}