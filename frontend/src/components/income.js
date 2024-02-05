export class Income {
    constructor() {
        this.editButtons = document.querySelectorAll('.income .categories .category .category-buttons .edit');
        this.editButtons.forEach(editButton => {
            editButton.addEventListener('click', ()=> {
                location.href = '#/income/edit';
            })
        });

        this.addButton = document.getElementById('add');
        if (this.addButton) {
            this.addButton.addEventListener('click', ()=> {
                location.href = '#/income/create';
            });
        }
    }
}