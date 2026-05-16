import noteQueries from "../models/db/notes.js";
import userQueries from "../models/db/users.js";

// async function adminGet(req, res) {
//     const notes = await noteQueries.noteQuery("all", "adminLog");
//     // console.dir(notes);
//     return res.render("index", {
//         main: "admin",
//         styles: ["admin"],
//         notes: notes,
//     });
// }

// TEMP CONTROLLER
async function adminGet(req, res) {
    const notes = await noteQueries.noteQuery("all", "adminLog");

    return res.render("index", {
        main: "admin",
        styles: ["admin"],
        notes: notes,
    });
}

async function notesQuery(req, res) {
    const search = req.query.search || "";
    let notes = await noteQueries.noteQuery(search, "adminLog");
    return res.json(notes);
}

async function usersQuery(req, res) {
    const search = req.query.search || "";
    const users = await userQueries.userQueryAll(search);
    return res.json(users);
}

async function usersQueryExact(req, res) {
    // const where =
    return;
}

async function usersAdd(req, res) {
    const newUser = req.newUser;
    const newUserAdd = await userQueries.addUser(newUser, req.user);
    return res.json(newUserAdd);
}

async function usersDelete(req, res) {
    let delUser = req.delUser;
    await userQueries.deleteUser(delUser, req.user);
    return res.json(delUser);
}

async function usersEdit(req, res) {
    let editUser = req.editUser;
    // console.dir(editUser, { depth: null });
    await userQueries.editUser(editUser, req.user);
    return res.json(editUser);
}

const adminController = {
    adminGet,
    notesQuery,
    usersQuery,
    usersQueryExact,
    usersAdd,
    usersDelete,
    usersEdit,
};

export default adminController;
