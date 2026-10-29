const postgres = require('../app-data-source');
const { IsNull, Not } = require('typeorm');
const { todayString } = require('../date');

async function index(req, res) {
    const checkoutRepo = postgres.getRepository('Checkout');

    const open = await checkoutRepo.find({
        where: { returnedOn: IsNull() },
        relations: { gear: true, member: true },
        order: { dueOn: 'ASC' }
    });

    const returned = await checkoutRepo.find({
        where: { returnedOn: Not(IsNull()) },
        relations: { gear: true, member: true },
        order: { returnedOn: 'DESC' },
        take: 5
    });

    res.render('Checkout/index', {
        title: 'Checkouts',
        open,
        returned,
        today: todayString()
    });
}

async function loadFormData() {
    const gearRepo = postgres.getRepository('Gear');
    const memberRepo = postgres.getRepository('Member');
    const checkoutRepo = postgres.getRepository('Checkout');

    const allGear = await gearRepo.find({ order: { name: 'ASC' } });
    const open = await checkoutRepo.find({
        where: { returnedOn: IsNull() },
        relations: { gear: true }
    });
    const checkedOutIds = open.map(c => c.gear.id);
    const availableGear = allGear.filter(g => !checkedOutIds.includes(g.id));

    const members = await memberRepo.find({ order: { lastName: 'ASC' } });

    return { availableGear, members };
}

async function newForm(req, res) {
    const { availableGear, members } = await loadFormData();
    res.render('Checkout/new', {
        title: 'Check Out Gear',
        availableGear,
        members,
        errors: [],
        values: {}
    });
}

async function create(req, res) {
    const checkoutRepo = postgres.getRepository('Checkout');
    const today = todayString();

    const gearId = Number(req.body.gearId);
    const memberId = Number(req.body.memberId);
    const dueOn = req.body.dueOn;

    const errors = [];

    if (!gearId) errors.push('Please choose gear.');
    if (!memberId) errors.push('Please choose a member.');

    if (!dueOn) {
        errors.push('Please choose a due date.');
    } else if (dueOn < today) {
        errors.push("The due date can't be in the past.");
    }

    if (gearId) {
        const alreadyOut = await checkoutRepo.count({
            where: { gear: { id: gearId }, returnedOn: IsNull() }
        });
        if (alreadyOut > 0) {
            errors.push('That gear is already checked out.');
        }
    }

    if (errors.length > 0) {
        const { availableGear, members } = await loadFormData();
        return res.render('Checkout/new', {
            title: 'Check Out Gear',
            availableGear,
            members,
            errors,
            values: req.body
        });
    }

    await checkoutRepo.save({
        gear: { id: gearId },
        member: { id: memberId },
        checkedOutOn: today,
        dueOn: dueOn
    });

    res.redirect('/checkouts');
}

async function markReturned(req, res) {
    const id = Number(req.params.id);

    if (Number.isInteger(id)) {
        const checkoutRepo = postgres.getRepository('Checkout');
        const checkout = await checkoutRepo.findOneBy({ id: id });

        if (checkout) {
            checkout.returnedOn = todayString();
            await checkoutRepo.save(checkout);
        }
    }

    res.redirect(req.get('Referer') || '/checkouts');
}

module.exports = {index, newForm, create, markReturned};