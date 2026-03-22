import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const WorkspaceMember = sequelize.define("WorkspaceMember", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,

    },
    workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'member'),
        allowNull: false,
        defaultValue: "member",
    }
}, {
    timestamps: true,
});

export default WorkspaceMember;