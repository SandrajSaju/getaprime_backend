const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Tier",
    tableName: "tiers",
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
        price: {
            type: "numeric",
            nullable: true
        },
        created_at: {
            type: "timestamp",
            createDate: true
        }
    },
    relations: {
        features: {
            type: "many-to-many",
            target: "Feature",
            joinTable: {
                name: "tier_features",
                joinColumn: {
                    name: "tier_id",
                    referencedColumnName: "id"
                },
                inverseJoinColumn: {
                    name: "feature_id",
                    referencedColumnName: "id"
                }
            },
            eager: true
        }
    }
});