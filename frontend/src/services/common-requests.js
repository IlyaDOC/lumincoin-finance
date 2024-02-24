import {CustomHttp} from "./custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";


export class CommonRequests {
    /************************************ Функции для главной страницы категорий доходов или расходов ******************/

    /** Получить с сервера категории в зависимости от текущего раздела в переменной path.
     * Также рендерит все категории по обратному циклу, чтобы категории
     * добавлялись перед кнопкой "Добавить категорию", но в правильном порядке */
    static async getCategories(path) {
        this.path = path;
        try {
            const result = await CustomHttp.request(config.host + '/categories/' + this.path);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
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


    /************************************ Функции для главной страницы и страницы доходов и расходов ******************/





    /** Функция добавляет возможность работы с фильтрами. */
    static getOperationsWithFilter(income = null, expense = null) {
        try {
            const filerButtons = document.querySelectorAll('.filter .filter-button');

            filerButtons.forEach(filterButton => {
                filterButton.addEventListener('click', async () => {

                    filerButtons.forEach(filterButton => {
                        filterButton.classList.remove('filter-button-active');
                    });
                    filterButton.classList.add('filter-button-active');

                    if (filterButton.hasAttribute('data-filter')
                        && filterButton.getAttribute('data-filter') === 'today') {
                        let result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom='
                            + this.getTodayDate() + '&dateTo=' + this.getTodayDate());
                        if (location.hash !== '#/main') {
                            this.renderResult(result)
                        } else {
                            this.addDataToDiagrams(result, income, expense)
                        }

                    } else if (filterButton.hasAttribute('data-filter')
                        && filterButton.getAttribute('data-filter') === 'interval') {
                        const startDateElement = document.getElementById('startDate');
                        const endDateElement = document.getElementById('endDate');

                        endDateElement.addEventListener('input', async () => {
                            let result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom='
                                + startDateElement.value + '&dateTo=' + endDateElement.value);
                            if (location.hash !== '#/main') {
                                this.renderResult(result)
                            } else {
                                this.addDataToDiagrams(result, income, expense)
                            }
                        })

                    } else {
                        let result = await CustomHttp.request(config.host + '/operations?period=' +
                            filterButton.getAttribute('data-filter'));
                        if (location.hash !== '#/main') {
                            this.renderResult(result)
                        } else {
                            this.addDataToDiagrams(result, income, expense)
                        }
                    }
                });
            });
        } catch (error) {
            console.log(error);

        }
    };

    /** Функция на вход получает объект из запроса,
     * затем рендерит результат*/
    static renderResult(result) {
        if (result) {
            if (result.error) {
                throw new Error(result.error);
            }

            document.querySelectorAll('#tbody > tr').forEach(element => {
                element.remove();
            });
            let tbodyElement = document.getElementById('tbody');
            result.forEach((item, index) => {
                let itemRowElement = document.createElement('tr');
                let thNumberElement = document.createElement('th');
                thNumberElement.innerText = index + 1;
                let typeOfElement = document.createElement('td');
                typeOfElement.innerText = item.type === 'income' ? 'доход' : 'расход';
                this.colorManager(typeOfElement);

                let titleOfElement = document.createElement('td');
                titleOfElement.innerText = item.category ? item.category : 'без категории';

                let amountElement = document.createElement('td');
                amountElement.innerText = `${item.amount}$`

                let dateElement = document.createElement('td');
                dateElement.innerText = this.formattedDateFromRequest(item.date);

                let commentElement = document.createElement('td');
                commentElement.classList.add('comment');
                commentElement.innerText = item.comment;

                let actionCellElement = document.createElement('td');
                actionCellElement.classList.add('action-cell');

                let deleteActionCellElement = document.createElement('div');
                deleteActionCellElement.classList.add('delete-action');
                deleteActionCellElement.setAttribute('title', 'Удалить');
                deleteActionCellElement.setAttribute('data-id', item.id)

                let deleteActionIconElement = document.createElement('i');
                deleteActionIconElement.classList.add('bi', 'bi-trash');
                deleteActionIconElement.setAttribute('data-bs-toggle', 'modal');
                deleteActionIconElement.setAttribute('data-bs-target', '#deleteModal');

                let editActionCellElement = document.createElement('div');
                editActionCellElement.classList.add('edit-action');
                editActionCellElement.setAttribute('title', 'Редактировать');
                editActionCellElement.setAttribute('data-id', item.id)

                let editActionIconElement = document.createElement('i');
                editActionIconElement.classList.add('bi', 'bi-pencil');

                deleteActionCellElement.appendChild(deleteActionIconElement);
                editActionCellElement.appendChild(editActionIconElement);
                actionCellElement.appendChild(deleteActionCellElement);
                actionCellElement.appendChild(editActionCellElement);


                itemRowElement.appendChild(thNumberElement);
                itemRowElement.appendChild(typeOfElement);
                itemRowElement.appendChild(titleOfElement);
                itemRowElement.appendChild(amountElement);
                itemRowElement.appendChild(dateElement);
                itemRowElement.appendChild(commentElement);
                itemRowElement.appendChild(actionCellElement);
                tbodyElement.appendChild(itemRowElement);
                const editActions = document.querySelectorAll('.edit-action');
                this.editActionManager(editActions);
                this.deleteProcessIAE();
            });
        }
    };

    /** Функция получает данные из запроса в переменную result и по этим данным формируются диаграммы */
    static addDataToDiagrams(result, income, expense) {
        income.data.labels = [];
        income.data.datasets[0].data = [];
        expense.data.labels = [];
        expense.data.datasets[0].data = [];
        income.update();
        expense.update();
        result.forEach(item => {
            if (item.type === 'income') {
                const existingCategoryIndex =
                    income.data.labels.findIndex(label => label === item.category);
                if (existingCategoryIndex === -1) { //Если такой категории нет в массиве
                    income.data.labels.push(item.category);
                    income.data.datasets[0].data.push(item.amount);
                } else { // Если такая категория есть уже, то значения денег суммируются
                    income.data.datasets[0].data[existingCategoryIndex] += item.amount;
                }

                income.update();
            } else {
                const existingCategoryIndex =
                    expense.data.labels.findIndex(label => label === item.category);
                if (existingCategoryIndex === -1) {
                    expense.data.labels.push(item.category);
                    expense.data.datasets[0].data.push(item.amount);
                } else {
                    expense.data.datasets[0].data[existingCategoryIndex] += item.amount;
                }

                expense.update();
            }
        })
    }


    /** Меняет цвет в зависимости от типа операции*/
    static colorManager(text) {
        if (text.innerText === 'доход') {
            text.style.color = '#198754';
        } else if (text.innerText === 'расход') {
            text.style.color = '#DC3545';
        }
    };

    /** Добавляет функцию перехода на страницу редактирования
     * для кнопки редактировать (карандаш)*/
    static editActionManager(editActions) {
        editActions.forEach(action => {
            action.addEventListener('click', function (event) {
                location.href = '#/income-and-expenses/edit?id=' + this.getAttribute('data-id');
            });
        });
    };

    /** Форматирует дату из ответа сервера */
    static formattedDateFromRequest(date) {
        let dateArray = date.split('-');
        return `${dateArray[2]}.${dateArray[1]}.${dateArray[0]}`;
    }

    /** Функция нужна для функции удаления операции на странице доходов и расходов */
    static deleteProcessIAE() {
        document.querySelectorAll('.delete-action').forEach(buttonDelete => {
            let buttonDeleteId = buttonDelete.getAttribute('data-id');
            buttonDelete.addEventListener('click', () => {
                sessionStorage.setItem('deleteId', buttonDeleteId);
            });
        });
    };

    /** Получает сегодняшнюю дату, отформатированную в ГГГГ-ММ-ДД*/
    static getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /** Запрос по умолчанию, при загрузке страницы категорий
     * доходов и расходов.
     * По умолчанию это операции за сегодняшний день*/
    static async getOperationsDefault(income = null, expense = null) {
        try {
            const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom='
                + this.getTodayDate() + '&dateTo=' + this.getTodayDate());
            if (location.hash !== '#/main') {
                CommonRequests.renderResult(result);
            } else {
                CommonRequests.addDataToDiagrams(result, income, expense)
            }

        } catch (error) {
            console.log(error)
        }
    }
}