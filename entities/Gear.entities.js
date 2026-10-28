const {EntitySchema} = require('typeorm');
const GearModel = require('../models/Gear');

const Gear = new EntitySchema({
    name: 'Gear',
    tableName: 'gear',
    target: GearModel,
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: 'increment'
        },
        name: {
            type: 'varchar',
            length: 100
        },
        category: {
            type: 'varchar',
            lenth: 50
        },
        condition: {
            type: 'varchar',
            length: 30,
            default: 'Good'
        },
        dailyFee: {
            name: 'daily_fee',
            type: 'float',
            default: 0
        },
        description: {
            type: 'text',
            nullable: true
        }
    }
});

module.exports = Gear;
