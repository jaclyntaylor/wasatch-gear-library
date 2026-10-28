require('reflect-metadata')
require('dotenv').config()

const express = require("express");
const postgres = require('./app-data-source');
const {todayString} = require("./date");
const { IsNull, LessThan } = require('typeorm');
const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static("public"))

async function gearCount() {
    const gearRepo = postgres.getRepository('Gear');
    return await gearRepo.count();
}

async function memberCount() {
    const memberRepo = postgres.getRepository('Member');
    return await memberRepo.count();
}

async function checkedOutCount() {
    const checkedOutRepo = postgres.getRepository('Checkout');
    return await checkedOutRepo.count({
        where: {returnedOn: IsNull() }
    });
}

async function overDueCount(today) {
    const checkoutRepo = postgres.getRepository('Checkout');
    return await checkoutRepo.count({
        where: {returnedOn: IsNull(), dueOn: LessThan(today)}
    })
}

async function openCheckouts() {
    const checkoutRepo = postgres.getRepository('Checkout');
    return await checkoutRepo.find({
        where: {returnedOn: IsNull()},
        relations: {gear: true, member: true},
        order: {dueOn: 'ASC'}
    })
}

app.get('/', async (req, res) => {
  const today = todayString();
  const gearTotal = await gearCount();
  const memberTotal = await memberCount();
  const checkedOutTotal = await checkedOutCount();
  const overdueTotal = await overDueCount(today);
  const openCheckout = await openCheckouts();

  res.render('index', {
    title: 'Dashboard',
    gearTotal,
    memberTotal,
    checkedOutTotal,
    overdueTotal,
    openCheckout,
    today
  });
});

postgres.initialize().then(()=>{
    app.listen(3000, () => {
        console.log("Listening on http://localhost:3000");
    });
})
.catch((err)=> {
    console.log('Something went wrong :(', err)
})