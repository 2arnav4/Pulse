import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Workspace = sequelize.define("Workspace", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }

}, {
    timestamps: true,
});

export default Workspace;
