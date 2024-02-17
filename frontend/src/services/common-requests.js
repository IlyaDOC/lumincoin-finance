import {CustomHttp} from "./custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";

export class CommonRequests {



    /** Получить с сервера категории в зависимости от текущего раздела в переменной path.
     * Также рендерит все категории по обратному циклу, чтобы категории
     * добавлялись перед кнопкой "Добавить категорию", но в правильном порядке */
    static async getCategories(path) {
        this.path = path;
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + this.path);
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

                this.editProcess(this.path);
                this.deleteProcess();

            }
        } catch (error) {
            console.log(error);
        }
    };

    /** Метод находит по селектору кнопку "Редактировать", далее к каждой кнопке добавляет id категории
     * и при нажатии на кнопку передает id в query параметры в ссылке */

    static editProcess(path) {
        document.querySelectorAll('.categories .category-buttons .edit').forEach(buttonEdit => {
            let buttonEditId = buttonEdit.getAttribute('data-id');
            buttonEdit.addEventListener('click', () => {
                location.href = '#/' + (path === 'income' ? path : path + 's') + '/edit?id=' + buttonEditId;
            });
        });
    };


    /** Метод находит по селектору все кнопки "Удалить", при ее нажатии она
     * получает id категории и добавляет в SessionStorage */
    static deleteProcess() {
        document.querySelectorAll('.categories .category-buttons .delete').forEach(buttonDelete => {
            let buttonDeleteId = buttonDelete.getAttribute('data-id');
            buttonDelete.addEventListener('click', () => {
                sessionStorage.setItem('deleteId', buttonDeleteId);
            });
        });
    };

    /** Метод для редактирования категорий.
     * Сначала через routeParams получает query параметры из которого затем используется id.
     * Далее запрос на сервер, чтобы получить название конкретной категории и добавить ее в поле инпута.
     * После редактирования отправляется PUT запрос на сервер
     * с новым названием категории и возврат на страницу с категориями.
     * В location.href используется тернарный оператор, т.к. страница с
     * категориями расходов называется expenses, а в path передается expense.
     * Я не продумал это изначально, поэтому проще было использовать тернарный оператор,
     * чем изменять все роуты */

    static async editCategory(path) {
        const routeParams = UrlManager.getQueryParams();
        let saveBtn = document.getElementById('save-btn');
        let editInput = document.getElementById('edit-input');
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + path + '/' + routeParams.id);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                editInput.value = result.title;
            }

            if (editInput.value) {
                saveBtn.addEventListener('click', async () => {
                    await CustomHttp.request(config.host + '/categories/' + path + '/' + routeParams.id, 'PUT', {
                        title: editInput.value
                    })
                    location.href = '#/' + (path === 'income' ? path : path + 's');
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    /** Этот метод удаляет выбранную категорию. После нажатия на кнопку "Удалить", открывается
     * модальное окно, в котором при подтверждении операции, отправляется запрос на
     * бэк с методом DELETE. Далее окно закрывается, но удаленная категория остается,
     * поэтому удаляем все категории со страницы, после чего делаем запрос на сервер,
     * чтобы заново получить все категории.*/

    static async deleteCategory(path) {
        document.getElementById('delete-button-modal').addEventListener('click', async () => {
            await CustomHttp.request(config.host + '/categories/' + path + '/' + sessionStorage.getItem('deleteId'), 'DELETE');
            document.querySelectorAll('.categories-grid .col:not(:last-child)').forEach(element => {
                element.remove();
            })
            await this.getCategories(path);
        })
    };

    /** Этот метод добавляет новую категорию с выбранным названием.
     * Метод получает значение поля create-input и при нажатии кнопки
     * "Создать" отправляет запрос с методом 'POST' с указанным названием,
     * после чего происходит возврат на страницу с категориями*/

    static async addCategory(path) {
        const createButton = document.getElementById('create-button');
        const createInput = document.getElementById('create-input');
        let createInputValue;
        createInput.addEventListener('input', (event) => {
            createInputValue = event.target.value;
            if (!createInputValue) {
                createInput.classList.add('is-invalid');
            } else {
                if (createInput.classList.contains('is-invalid')) {
                    createInput.classList.remove('is-invalid');
                }
                createInput.classList.add('is-valid');
            }
        });
        createButton.addEventListener('click', async () => {
            try {
                if (!createInputValue) {
                    createInput.classList.add('is-invalid');
                } else {
                    let request = await CustomHttp.request(config.host + '/categories/' + path, 'POST', {
                        title: createInputValue
                    });

                    if (request) {
                        location.href = '#/' + (path === 'income' ? path : path + 's');
                    } else {
                        throw new Error(request.message)
                    }
                }
            } catch (error) {
                console.log(error);
            }

        });

        document.getElementById('create-cancel-button').addEventListener('click', () => {
            location.href = '#/' + (path === 'income' ? path : path + 's');
        });
    };
}