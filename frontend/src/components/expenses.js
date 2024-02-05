
export class Expenses {
    constructor() {
        this.editButtons = document.querySelectorAll('.income .categories .category .category-buttons .edit');
        this.editButtons.forEach(editButton => {
            editButton.addEventListener('click', ()=> {
                location.href = '#/expenses/edit';
            })
        });

        this.addButton = document.getElementById('add');
        if (this.addButton) {
            this.addButton.addEventListener('click', ()=> {
                location.href = '#/expenses/create';
            });
        }

    }
}