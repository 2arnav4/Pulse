import { sequelize } from "../config/database.js"
import { DataTypes } from "sequelize"


const Task = sequelize.define("Task", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("todo", "in-progress", "done"),
        defaultValue: "todo",
        allowNull: false
    },
    workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    timestamps: true,
});
export default Task;