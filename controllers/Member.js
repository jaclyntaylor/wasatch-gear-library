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

module.exports = {index};