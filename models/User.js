const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "User", // Entity name
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        username: {
            type: "varchar",
            length: 100,
            unique: true
        },
        email: {
            type: "varchar",
            length: 150,
            unique: true
        },
        password: {
            type: "varchar"
        },
        subscription_start: {
            type: "timestamp",
            nullable: true
        },
        subscription_end: {
            type: "timestamp",
            nullable: true
        },
        is_deleted: {
            type: "boolean",
            default: false
        },
        created_at: {
            type: "timestamp",
            createDate: true
        },
        updated_at: {
            type: "timestamp",
            updateDate: true
        }
    },
    relations: {
        tier: {
            type: "many-to-one",
            target: "Tier",
            joinColumn: { name: "tier_id" },
            eager: true
        }
    }
});