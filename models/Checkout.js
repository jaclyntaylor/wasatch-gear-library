class Checkout {
    constructor(id, member, checkedOutOn, dueOn, returnedOn) {
        this.id = id;
        this.member = member;
        this.checkedOutOn = checkedOutOn;
        this.dueOn = dueOn;
        this.returnedOn = returnedOn;
    }
}

module.exports = Checkout;