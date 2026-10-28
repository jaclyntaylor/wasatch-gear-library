const postgres = require('../app-data-source');
const { IsNull } = require('typeorm');

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

module.exports = { index };