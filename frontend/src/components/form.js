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
        const isValid = validForm && this.confirmFlag;
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
}