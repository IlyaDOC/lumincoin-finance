import {Chart} from 'chart.js/auto';

export class Diagrams {
    constructor() {

        this.myChart1 = document.getElementById('myChart1');
        this.myChart2 = document.getElementById('myChart2');

        new Chart(this.myChart1, {
            type: 'pie',
            data: {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
                datasets: [{
                    label: "dollars",
                    data: [12, 19, 3, 5, 2],
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                    borderWidth: 1
                }]
            },
            options: {

            }
        });
        new Chart(this.myChart2, {
            type: 'pie',
            data: {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
                datasets: [{
                    label: 'dollars',
                    data: [8, 13, 5, 10, 11],
                    backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                    borderWidth: 1
                }]
            },
            options: {

            }
        });
    }
}