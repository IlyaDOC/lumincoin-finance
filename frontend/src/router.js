import {Form} from "./components/form.js";
import {Main} from "./components/main.js";
import {Income} from "./components/income.js";
import {Expenses} from "./components/expenses.js";
import {IncomeAndExpenses} from "./components/income-and-expenses.js";
import {Auth} from "./services/auth.js";
export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.titleElement = document.getElementById('page-title');
        this.stylesElement = document.getElementById('styles');
        this.userNameElement = document.getElementById('sidebar-user-name');


        this.routes = [
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'styles/main.css',
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: 'styles/income.css',
                load: () => {
                    new Income();
                }
            },
            {
                route: '#/income/edit',
                title: 'Редактирование категорий доходов',
                template: 'templates/income-edit.html',
                styles: 'styles/income.css',
                load: () => {
                    new Income();
                }
            },
            {
                route: '#/income/create',
                title: 'Создание категории доходов',
                template: 'templates/income-create.html',
                styles: 'styles/income.css',
                load: () => {
                    new Income();
                }
            },
            {
                route: '#/expenses',
                title: 'Расходы',
                template: 'templates/expenses.html',
                styles: 'styles/expenses.css',
                load: () => {
                    new Expenses();
                }
            },
            {
                route: '#/expenses/edit',
                title: 'Редактирование категорий расходов',
                template: 'templates/expenses-edit.html',
                styles: 'styles/expenses.css',
                load: () => {
                    new Expenses();
                }
            },
            {
                route: '#/expenses/create',
                title: 'Создание категории расходов',
                template: 'templates/expenses-create.html',
                styles: 'styles/expenses.css',
                load: () => {
                    new Expenses();
                }
            },
            {
                route: '#/income-and-expenses',
                title: 'Доходы и расходы',
                template: 'templates/income-and-expenses.html',
                styles: 'styles/income-and-expenses.css',
                load: () => {
                    new IncomeAndExpenses();
                }
            },
            {
                route: '#/income-and-expenses/edit',
                title: 'Редактирование доходов и расходов',
                template: 'templates/income-and-expenses-edit.html',
                styles: 'styles/income-and-expenses.css',
                load: () => {
                    new IncomeAndExpenses();
                }
            },
            {
                route: '#/income-and-expenses/create',
                title: 'Создание доходов и расходов',
                template: 'templates/income-and-expenses-create.html',
                styles: 'styles/income-and-expenses.css',
                load: () => {
                    new IncomeAndExpenses();
                }
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0];

        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/signup';
            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
           return window.location.href = '#/signup';
        }

        this.stylesElement.setAttribute('href', newRoute.styles);
        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text());
        this.titleElement.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.userNameElement.innerHTML = `${userInfo.name} ${userInfo.lastName}`;
        }

        newRoute.load();
    }
}