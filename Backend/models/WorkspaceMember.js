import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const WorkspaceMember = sequelize.define("WorkspaceMember", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "member",
    }
}, {
    timestamps: true,
});

export default WorkspaceMember;