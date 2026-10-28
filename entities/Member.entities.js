const {EntitySchema} = require('typeorm');
const MemberModel = require('../models/Member');

const Member = new EntitySchema({
    name: 'Member',
    tableName: 'members',
    target: MemberModel,
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: 'increment'
        },
        firstName: {
            name: 'first_name',
            type: 'varchar',
            length: 50
        },
        lastName: {
            name: 'last_name',
            type: 'varchar',
            length: 50
        },
        email: {
            type: 'varchar',
            length: 100,
            unique: true
        },
        joinedOn: {
            name: 'joined_on',
            type: 'date'
        }
    }
})

module.exports = Member;
