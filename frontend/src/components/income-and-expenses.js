export class IncomeAndExpenses {
    constructor() {
        this.tableTextColor = document.querySelectorAll('.table tbody tr > td');
        this.editActions = document.querySelectorAll('.table tbody tr .action-cell .edit-action');

        this.colorManager();
        this.editActionManager();
    }

    colorManager() {
        this.tableTextColor.forEach(text=> {
           if (text.innerHTML === 'доход' ) {
               text.style.color = '#198754';
           } else if (text.innerHTML === 'расход') {
               text.style.color = '#DC3545';
           }
        });
    };

    editActionManager() {
        this.editActions.forEach(action=> {
            action.addEventListener('click', ()=> {
                location.href = '#/income-and-expenses/edit';
            });
            
        });
    };


}