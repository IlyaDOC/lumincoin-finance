import {Chart} from 'chart.js/auto';
import {IncomeAndExpenses} from "./income-and-expenses.js";

export class Diagrams {
    constructor() {

        this.myChart1 = document.getElementById('myChart1');
        this.myChart2 = document.getElementById('myChart2');

        this.income = new Chart(this.myChart1, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    label: "dollars",
                    data: [],
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                    borderWidth: 1
                }]
            },
            options: {

            }
        });
        this.expense = new Chart(this.myChart2, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    label: 'dollars',
                    data: [],
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                    borderWidth: 1
                }]
            },
            options: {

            }
        });
    }
}