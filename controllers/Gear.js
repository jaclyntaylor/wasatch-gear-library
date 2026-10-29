const postgres = require('../app-data-source');
const { IsNull } = require('typeorm');
const { todayString } = require('../date');
const QRCode = require('qrcode');

async function index(req, res) {
    const gearRepo = postgres.getRepository('Gear');
    const checkoutRepo = postgres.getRepository('Checkout');      

    
    const category = req.query.category;
    let filter = {};
    if (category) {
        filter = { category: category };
    }

    const items = await gearRepo.find({
        where: filter,                                            
        order: { name: 'ASC' }
    });

    const openCheckouts = await checkoutRepo.find({
        where: { returnedOn: IsNull() },
        relations: { gear: true }
    });
    const checkedOutIds = openCheckouts.map(c => c.gear.id);

    items.forEach(item => {
        item.available = !checkedOutIds.includes(item.id);
    });


    const allGear = await gearRepo.find();
    const categories = [...new Set(allGear.map(g => g.category))].sort();

    res.render('Gear/index', {
        title: 'Gear Catalog',
        items,
        categories,                              
        category                                                  
    });
}

async function show(req, res) {
    const id = Number(req.params.id)

    if (!Number.isInteger(id)){
        return res.status(404).send('TRY AGAIN! NO GEAR EXISTS :(')
    }

    const gearRepo = postgres.getRepository('Gear')
    const item = await gearRepo.findOneBy({id: id})

    if (!item) {
        return res.status(404).send('TRY AGAIN! NO GEAR EXISTS :(')
    }

    const checkoutRepo = postgres.getRepository('Checkout')
    const history = await checkoutRepo.find({
        where: {gear: {id: id}},
        relations: {gear: true, member: true},
        order: {checkedOutOn: 'DESC'}
    })
    const available = !history.some(c => c.returnedOn == null)

    const today = todayString()

    
    const host = req.get('x-forwarded-host') || req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const pageUrl = `${protocol}://${host}/gear/${item.id}`;


    const qrCode = await QRCode.toDataURL(pageUrl);

    res.render('Gear/show', {title: item.name, item, history, available, today, qrCode, pageUrl})
}

function newForm(req,res) {
    res.render('Gear/form', {
        title: 'Add Gear',
        item: {},
        action: '/gear'
    });
}

async function create(req, res) {
    const gearRepo = postgres.getRepository('Gear')

    const saved = await gearRepo.save({
        name: req.body.name,
        category: req.body.category,
        condition: req.body.condition,
        dailyFee: Number(req.body.dailyFee) || 0,
        description: req.body.description || null
    })

    res.redirect(`/gear/${saved.id}`)
}


async function editForm(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(404).send('Gear not found');
    }

    const gearRepo = postgres.getRepository('Gear');
    const item = await gearRepo.findOneBy({ id: id });
    if (!item) {
        return res.status(404).send('Gear not found');
    }

    res.render('Gear/form', {
        title: `Edit ${item.name}`,
        item,
        action: `/gear/${item.id}/edit`
    });
}

async function update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(404).send('Gear not found');
    }

    const gearRepo = postgres.getRepository('Gear');
    const item = await gearRepo.findOneBy({ id: id });
    if (!item) {
        return res.status(404).send('Gear not found');
    }

    item.name = req.body.name;
    item.category = req.body.category;
    item.condition = req.body.condition;
    item.dailyFee = Number(req.body.dailyFee) || 0;
    item.description = req.body.description || null;

    await gearRepo.save(item);
    res.redirect(`/gear/${item.id}`);
}


module.exports = {index, show, newForm, create, editForm, update};