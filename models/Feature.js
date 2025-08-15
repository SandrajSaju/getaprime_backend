const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Feature",
    tableName: "features",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true
        },
        name: {
            type: "varchar",
            unique: true
        },
        description: {
            type: "text",
            nullable: true
        },
        category: {
            type: "varchar",
            nullable: true
        },
        created_at: {
            type: "timestamp",
            createDate: true
        }
    }
});