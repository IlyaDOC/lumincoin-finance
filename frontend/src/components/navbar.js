import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Navbar {
    constructor() {
        this.dropdownElement = document.getElementById('dropdown');
        this.sidebarElement = document.getElementById('sidebar');
        this.sidebarToggleButton = document.getElementById('sidebarToggle');
        this.sidebarToggleButtonIcon = document.querySelector('#sidebarToggle i');
        this.listItems = document.querySelectorAll('#sidebar > .main-part > ul > li a');
        this.clickList = document.querySelectorAll('.click-btn');
        this.userNameElement = document.getElementById('sidebar-user-name');
        this.balanceElement = document.getElementById('balance');


        this.dropdownElement.addEventListener('click', () => {
            this.dropdownElement.classList.toggle('dropdown-active');
        });
        this.activeStyle();
        this.toggleButton();
        this.navbarSizeChange();
        this.navbarClickClose();

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.userNameElement.innerHTML = `${userInfo.name} ${userInfo.lastName}`;
        }
        this.getBalance();

    }

    activeStyle() {
        this.listItems.forEach(item => {
            item.addEventListener('click', () => {
                this.listItems.forEach(button => {
                    button.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
    };

    toggleButton() {
        this.sidebarToggleButton.addEventListener('click', () => {
            this.sidebarElement.classList.toggle('collapsed');
            document.querySelector('#sidebar .nav-pills').classList.toggle('row-gap-2');
            if (this.sidebarElement.classList.contains('collapsed')) {
                this.sidebarToggleButtonIcon.className = 'bi bi-box-arrow-right d-block';
            } else {
                this.sidebarToggleButtonIcon.className = 'bi bi-box-arrow-left d-block';
            }
        });
    };

    navbarSizeChange() {
        window.addEventListener('resize', ()=> {
            if (window.innerWidth <= 1232) {
                this.sidebarElement.classList.add('collapsed');
            }
        });
    };

    navbarClickClose() {
        if (window.innerWidth <= 1232) {
            this.clickList.forEach(item=> {
                item.addEventListener('click', ()=> {
                    this.sidebarElement.classList.add('collapsed');
                })
            });
        }
    }

    async getBalance() {
        try {
            const result = await CustomHttp.request(config.host + '/balance');
            if (result.error) {
                throw new Error(result.error)
            }
            console.log(result);
            this.balanceElement.innerText = `${result.balance} $`;
        } catch (error) {
            console.log(error)
        }
    }
}