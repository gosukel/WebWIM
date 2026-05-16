import userQueries from "../../models/db/users.js";
import WarehouseError from "../../errors/WarehouseError.js";

function checkUserFullname(value) {
    if (value === "") {
        throw new WarehouseError("User Error", "User FULL NAME required");
    }

    let titleCaseValue = value
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return titleCaseValue;
}

function checkUserUsername(value) {
    if (value === "") {
        throw new WarehouseError("User Error", "User USERNAME required");
    }
    return value.toLowerCase();
}

function checkUserNickname(value) {
    if (value === "") {
        throw new WarehouseError("User Error", "User NICKNAME required");
    }

    if (value.length > 3) {
        throw new WarehouseError(
            "User Error",
            "User NICKNAME too long (MAX 3 CHARACTERS)",
        );
    }
    return value.toUpperCase();
}

function checkUserEmail(value) {
    if (value === "") {
        throw new WarehouseError("User Error", "User EMAIL required");
    }
    // regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        throw new WarehouseError(
            "User Error",
            "User EMAIL invalid format. (ex. 'name@test.com')",
        );
    }
    return value;
}

function checkUserBranch(value) {
    if (value === "") {
        throw new WarehouseError("User Error", "User BRANCH required");
    }
    if (value !== "024") {
        throw new WarehouseError("User Error", "Invalid User BRANCH");
    }
    return value;
}

function checkUserRole(value) {
    if (value === "") {
        throw new WarehouseError("User Error", "User ROLE required");
    }
    if (value !== "USER" && value !== "ADMIN") {
        throw new WarehouseError("User Error", "Invalid User ROLE");
    }
    return value;
}

function checkUserPassword(password, passwordConfirm) {
    if (password === "" && passwordConfirm === "") return;
    if (password.length < 8) {
        throw new WarehouseError(
            "User Error",
            "User PASSWORD must be at least 8 characters long",
        );
    }
    if (password !== passwordConfirm) {
        throw new WarehouseError(
            "User Error",
            "User PASSWORD and CONFIRM PASSWORD must match",
        );
    }
    return password;
}

async function checkUniques(editUser) {
    const where = {
        OR: [
            {
                AND: [
                    {
                        fullName: {
                            equals: editUser.fullName,
                            mode: "insensitive",
                        },
                    },
                    { id: { not: editUser.id } },
                ],
            },
            {
                AND: [
                    {
                        username: {
                            equals: editUser.username,
                            mode: "insensitive",
                        },
                    },
                    { id: { not: editUser.id } },
                ],
            },
            {
                AND: [
                    {
                        nickname: {
                            equals: editUser.nickname,
                            mode: "insensitive",
                        },
                    },
                    { id: { not: editUser.id } },
                ],
            },
            {
                AND: [
                    {
                        email: {
                            equals: editUser.email,
                            mode: "insensitive",
                        },
                    },
                    { id: { not: editUser.id } },
                ],
            },
        ],
    };
    let userMatch = await userQueries.userQueryExact(where);

    // console.dir(userMatch, { depth: null });
    // no matches found, valid data
    if (!userMatch) {
        console.log("no dupes found");
        return true;
    }

    // some match found, invalid data
    if (editUser.fullName === userMatch.fullName) {
        throw new WarehouseError("User Error", "User FULL NAME already exists");
    } else if (editUser.username === userMatch.username) {
        throw new WarehouseError("User Error", "User USERNAME already exists");
    } else if (editUser.nickname === userMatch.nickname) {
        throw new WarehouseError("User Error", "User NICKNAME already exists");
    } else if (editUser.email === userMatch.email) {
        throw new WarehouseError("User Error", "User EMAIL already exists");
    } else {
        throw new WarehouseError("User Error", "User DATA invalid");
    }
}

async function validateEditUser(req, res, next) {
    // console.dir(req.body, { depth: null });
    const editUser = {
        fullName: checkUserFullname(req.body["user-fullName-input"]),
        username: checkUserUsername(req.body["user-username-input"]),
        nickname: checkUserNickname(req.body["user-nickname-input"]),
        email: checkUserEmail(req.body["user-email-input"]),
        branch: checkUserBranch(req.body["user-branch-input"]),
        role: checkUserRole(req.body["user-role-input"]),
        password: checkUserPassword(
            req.body["user-password-input"],
            req.body["user-password-confirm-input"],
        ),
        id: Number(req.body.userId),
    };
    await checkUniques(editUser);

    req.editUser = editUser;
    next();
}

export default validateEditUser;
