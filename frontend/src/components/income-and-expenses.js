import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {UrlManager} from "../utils/url-manager.js";
import {Navbar} from "./navbar.js";
import {CommonRequests} from "../services/common-requests.js";

export class IncomeAndExpenses {
    constructor() {
        this.typeOfElement = document.getElementById('typeOf');
        this.category = document.getElementById('category');
        this.editActions = null;
        this.confirmButton = document.getElementById('confirm-button');
        this.init();
        CommonRequests.getOperationsWithFilter();

        this.navbar = new Navbar();

        if (location.hash === '#/income-and-expenses/create') {
            this.amountChecker();
            this.requestCategories();
            this.createOperation();
        }
    }

    async init() {
        if (location.hash === '#/income-and-expenses') {
            await CommonRequests.getOperationsDefault();
            await this.deleteOperation();
        }

        if (location.hash !== '#/income-and-expenses' && location.hash !== '#/income-and-expenses/create'
            && location.hash !== '#/main') {
            await this.editOperation();
        }
    }


    /** Добавляет в Select элементы в зависимости от типа запроса.
     * При наличии второго параметра, сравнивает название option элемента с
     * этим параметром и добавляет ему атрибут Selected. Это требуется в функции
     * редактирования, чтобы сразу выбиралась категория операции*/
    renderOptions(result, category = null) {
        result.forEach(item => {
            let optionElement = document.createElement('option');
            optionElement.setAttribute('name', 'category');
            optionElement.setAttribute('value', item.id);
            optionElement.innerText = item.title;
            if (item.title === category) {
                optionElement.setAttribute('selected', 'true');
            }
            this.category.appendChild(optionElement);
        });
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
                    this.renderOptions(result);

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

        try {
            const formElement = document.querySelector('.form');
            formElement.classList.add('was-validated');

            this.confirmButton.addEventListener('click', async (event) => {
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
                    await this.navbar.getBalance()
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


    /** Функция редактирования операции.
     * Из query параметров получает id операции, затем делает запрос на бэк для
     * получения значения полей и заполняет их.
     * Повторно запрашивает значения для Select. При изменении значения, повторно запрашивает новый список.
     * Далее при подтверждении отправляется запрос PUT на изменение операции*/
    async editOperation() {
        const routeParams = UrlManager.getQueryParams();

        try {
            if (routeParams) {
                const typeOfElement = document.getElementById('typeOf');
                const amountElement = document.getElementById('amount');
                const dateElement = document.getElementById('date');
                const commentElement = document.getElementById('comment');
                const category = document.getElementById('category');

                const result = await CustomHttp.request(config.host + '/operations/' + routeParams.id);


                typeOfElement.value = result.type;
                amountElement.value = result.amount;
                dateElement.value = result.date;
                commentElement.value = result.comment;

                const typeOfValue = typeOfElement.value;

                const getCategories = await CustomHttp.request(config.host + '/categories/' + typeOfValue);

                this.renderOptions(getCategories, result.category);
                await this.requestCategories();

                this.confirmButton.addEventListener('click', async () => {
                    const categoryId = category.value;
                    await CustomHttp.request(config.host + '/operations/' + routeParams.id, 'PUT', {
                        type: typeOfElement.value,
                        amount: amountElement.value,
                        date: dateElement.value,
                        comment: commentElement.value,
                        category_id: +categoryId
                    })
                    await this.navbar.getBalance()
                    location.href = '#/income-and-expenses';
                });
            }


        } catch (error) {
            console.log(error)
        }
    };

    /** Функция удаления операции */
    deleteOperation() {
        document.getElementById('delete-button-modal').addEventListener('click', async () => {
            await CustomHttp.request(config.host + '/operations/' + sessionStorage.getItem('deleteId'), 'DELETE');
            document.querySelectorAll('#tbody tr').forEach(element => {
                element.remove();
            })
            await this.navbar.getBalance()
            await CommonRequests.getOperationsDefault();
        })
    };
}