import config from "../../config/config.js";
import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";

export class Form {
    constructor(page) {
        this.page = page;
        this.passwordValue = null;
        this.confirmFlag = null;
        this.confirmPasswordValue = null;
        this.sidebarElement = document.getElementById('sidebar');
        this.password = document.getElementById('password');
        this.confirmPassword = document.getElementById('confirm-password');
        this.processElement = document.getElementById('process');

        if (location.hash === '#/signup' || location.hash === '#/login') {
            this.sidebarElement.style.display = 'none';
        }
        if (this.confirmPassword) {
            this.confirmedPasswords();
        }

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'fullName',
                    id: 'name',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]*([-][А-ЯЁ][а-яё]*)?\s[А-ЯЁ][а-яё]*\s[А-ЯЁ][а-яё]*$/,
                    valid: false,
                },
            );
        }


        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.addEventListener('input', function () {
                that.validateField.call(that, item, this);
            });
        });
        this.processElement.addEventListener('click', () => {
            this.processForm();
        });

    }

    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add('is-invalid');
            field.valid = false;
        } else {
            element.classList.remove('is-invalid');
            element.classList.add('is-valid');
            field.valid = true;
        }
        this.validateForm();
    };

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.confirmPassword ? validForm && this.confirmFlag : validForm;
        if (isValid) {
            this.processElement.classList.remove('disabled');
        } else {
            this.processElement.classList.add('disabled');
        }
        return isValid;
    };

    confirmedPasswords() {
        this.confirmPassword.addEventListener('input', (event) => {
            this.passwordValue = this.password.value;
            this.confirmPasswordValue = event.target.value;
            if ((this.passwordValue === this.confirmPasswordValue) && (this.confirmPasswordValue)) {
                this.confirmPassword.classList.remove('is-invalid');
                this.confirmPassword.classList.add('is-valid');
                this.confirmFlag = true;
            } else {
                this.confirmPassword.classList.remove('is-valid');
                this.confirmPassword.classList.add('is-invalid');
                this.confirmFlag = false;
            }
            this.validateForm();
        });
    };

    async processForm() {
        if (this.validateForm()) {

            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;


            if (this.page === 'signup') {
                const fullNameValue = this.fields.find(item => item.name === 'fullName').element.value;
                const fullNameArray = fullNameValue.split(' ');
                const name = fullNameArray[1];
                const lastName = fullNameArray[0];
                const passwordRepeat = this.confirmPassword.value;
                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: passwordRepeat
                    })

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }

            }
            try {
                let rememberValue = false;
                if (this.page === 'login') {
                    rememberValue = document.getElementById('remember-me').checked;
                }

                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                    rememberMe: rememberValue
                })

                if (result) {
                    if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken
                        || !result.user.name || !result.user.lastName || !result.user.id) {
                        throw new Error(result.message);
                    }
                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        name: result.user.name,
                        lastName: result.user.lastName,
                        userId: result.user.id
                    })
                    location.href = '#/main';
                }
            } catch (error) {
                console.log(error);
            }

        }
    };
}