const postgres = require('../app-data-source');
const { IsNull } = require('typeorm');
const { todayString } = require('../date');

async function index(req, res) {
    const memberRepo = postgres.getRepository('Member');
    const checkoutRepo = postgres.getRepository('Checkout');

    const members = await memberRepo.find({
        order: { lastName: 'ASC' }
    });


    const openCheckouts = await checkoutRepo.find({
        where: { returnedOn: IsNull() },
        relations: { member: true }
    });

    members.forEach(m => {
        m.outCount = openCheckouts.filter(c => c.member.id === m.id).length;
    });

    res.render('Member/index', { title: 'Members', members });
}


async function show(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(404).send('Member not found');
    }

    const memberRepo = postgres.getRepository('Member');
    const member = await memberRepo.findOneBy({ id: id });
    if (!member) {
        return res.status(404).send('Member not found');
    }

    
    const checkoutRepo = postgres.getRepository('Checkout');
    const checkouts = await checkoutRepo.find({
        where: { member: { id: id } },
        relations: { gear: true, member: true },
        order: { checkedOutOn: 'DESC' }
    });

    
    const current = checkouts.filter(c => c.returnedOn === null);
    const past = checkouts.filter(c => c.returnedOn !== null);

    res.render('Member/show', {
        title: member.getFullName(),
        member,
        current,
        past,
        today: todayString()
    });
}


async function create(req, res) {
    const memberRepo = postgres.getRepository('Member');

    const member = memberRepo.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        joinedOn: todayString()
    });
    const saved = await memberRepo.save(member);

    res.redirect(`/members/${saved.id}`);
}

module.exports = {index, show, create};