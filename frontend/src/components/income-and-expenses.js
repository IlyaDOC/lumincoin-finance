import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class IncomeAndExpenses {
    constructor() {
        this.typeOfElement = document.getElementById('typeOf');
        this.category = document.getElementById('category');
        this.editActions = null;
        this.init();
        this.getOperationsWithFilter();

        if (location.hash === '#/income-and-expenses/create') {
            this.amountChecker();
            this.requestCategories();
            this.createOperation();
        }
    }

    async init() {
        if (location.hash === '#/income-and-expenses') {
            await this.getOperationsDefault();
        }
    }
    /** Меняет цвет в зависимости от типа */
    colorManager(text) {
        if (text.innerText === 'доход') {
            text.style.color = '#198754';
        } else if (text.innerText === 'расход') {
            text.style.color = '#DC3545';
        }
    };
    /** Добавляет функцию перехода на страницу редактирования
     * для кнопки редактировать (карандаш)*/
    editActionManager(editActions) {
        editActions.forEach(action => {
            action.addEventListener('click', () => {
                location.href = '#/income-and-expenses/edit';
            });
        });
    };

    /** Получает сегодняшнюю дату, отформатированную в ГГГГ-ММ-ДД*/
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    /** Запрос по умолчанию, при загрузке страницы категорий
     * доходов и расходов.
     * По умолчанию это операции за сегодняшний день*/
    async getOperationsDefault() {
        const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom='
            + this.getTodayDate() + '&dateTo=' + this.getTodayDate());
        this.renderResult(result);
    }

    /** Функция на вход получает объект из запроса,
     * затем рендерит результат*/
    renderResult(result) {
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
                let deleteActionIconElement = document.createElement('i');
                deleteActionIconElement.classList.add('bi', 'bi-trash');
                deleteActionIconElement.setAttribute('data-bs-toggle', 'modal');
                deleteActionIconElement.setAttribute('data-bs-target', '#deleteModal');
                let editActionCellElement = document.createElement('div');
                editActionCellElement.classList.add('edit-action');
                editActionCellElement.setAttribute('title', 'Редактировать');
                let editActionIconElement = document.createElement('i');
                editActionIconElement.classList.add('bi', 'bi-pencil');

                deleteActionCellElement.appendChild(deleteActionIconElement);
                editActionCellElement.appendChild(editActionIconElement);
                actionCellElement.appendChild(deleteActionCellElement);
                actionCellElement.appendChild(editActionCellElement);
                this.editActions = document.querySelectorAll('.edit-action');
                this.editActionManager(this.editActions);

                itemRowElement.appendChild(thNumberElement);
                itemRowElement.appendChild(typeOfElement);
                itemRowElement.appendChild(titleOfElement);
                itemRowElement.appendChild(amountElement);
                itemRowElement.appendChild(dateElement);
                itemRowElement.appendChild(commentElement);
                itemRowElement.appendChild(actionCellElement);
                tbodyElement.appendChild(itemRowElement);
            });
        }
    };

    /** Функция добавляет возможность работы с фильтрами.
      */
    getOperationsWithFilter() {
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
                        const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom='
                            + this.getTodayDate() + '&dateTo=' + this.getTodayDate());
                        this.renderResult(result);
                    } else if (filterButton.hasAttribute('data-filter')
                        && filterButton.getAttribute('data-filter') === 'interval') {
                        const startDateElement = document.getElementById('startDate');
                        const endDateElement = document.getElementById('endDate');

                        endDateElement.addEventListener('input', async () => {
                            const result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom='
                                + startDateElement.value + '&dateTo=' + endDateElement.value);
                            this.renderResult(result);
                        })
                    } else {
                        const result = await CustomHttp.request(config.host + '/operations?period=' +
                            filterButton.getAttribute('data-filter'));
                        this.renderResult(result);
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    /** Форматирует дату из ответа сервера */
    formattedDateFromRequest(date) {
        let dateArray = date.split('-');
        return `${dateArray[2]}.${dateArray[1]}.${dateArray[0]}`;
    }

    /** Функция добавляет список категорий в select Тип... в зависимости
     * от выбранной категории */
    requestCategories() {
        try {
            this.typeOfElement.addEventListener('change', async () => {
                document.querySelectorAll('#category option').forEach(element => {
                    element.remove();
                });
                const typeOfValue = this.typeOfElement.value;
                if (typeOfValue) {
                    const result = await CustomHttp.request(config.host + '/categories/' + typeOfValue);

                    result.forEach(item => {
                        let optionElement = document.createElement('option');
                        optionElement.setAttribute('name', 'category');
                        optionElement.setAttribute('value', item.id);
                        optionElement.innerText = item.title;
                        this.category.appendChild(optionElement);
                    });

                    if (result) {
                        if (result.error) {
                            throw new Error(result.error);
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error)
        }
    };
    /** Функция делает запрос на создание нового вида операции */
    createOperation() {
        const confirmButton = document.getElementById('confirm-button');
        try {
            const formElement = document.querySelector('.form');
            formElement.classList.add('was-validated');
            confirmButton.addEventListener('click', async (event) => {
                const categoryElement = document.getElementById('category');
                const typeOfValue = this.typeOfElement.value;
                const categoryId = categoryElement.value;
                const amountValue = document.getElementById('amount').value;
                const dateValue = document.getElementById('date').value;
                const commentValue = document.getElementById('comment').value;

                if (typeOfValue && amountValue && dateValue && commentValue) {
                    const result = await CustomHttp.request(config.host + '/operations', 'POST', {
                        type: typeOfValue,
                        amount: amountValue,
                        date: dateValue,
                        comment: commentValue,
                        category_id: +categoryId
                    })
                    location.href = '#/income-and-expenses';
                }
            });
        } catch (error) {
            console.log(error)
        }

    }
    /** Не позволяет в поле ввода суммы вводить что-то, кроме цифр */
    amountChecker() {
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', function (event) {
            if (/\D/.test(this.value)) {
                this.value = this.value.replace(/\D/, '');
            }
        });
    };

    editOperation(){
        
    };
}