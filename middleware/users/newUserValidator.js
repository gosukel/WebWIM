import userQueries from "../../models/db/users.js";
import WarehouseError from "../../errors/WarehouseError.js";
import bcrypt from "bcrypt";

async function checkUserInput(newUser) {
    const where = {
        OR: [
            {
                username: {
                    equals: newUser.username,
                    mode: "insensitive",
                },
            },
            {
                fullName: {
                    equals: newUser.fullName,
                    mode: "insensitive",
                },
            },
            {
                nickname: {
                    equals: newUser.nickname,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    equals: newUser.email,
                    mode: "insensitive",
                },
            },
        ],
    };
    let userMatch = await userQueries.userQueryExact(where);

    // no matches found, valid data
    if (!userMatch) return true;

    // some match found, invalid data
    if (newUser.fullName === userMatch.fullName) {
        throw new WarehouseError("User Error", "User FULL NAME already exists");
    } else if (newUser.username === userMatch.username) {
        throw new WarehouseError("User Error", "User USERNAME already exists");
    } else if (newUser.nickname === userMatch.nickname) {
        throw new WarehouseError("User Error", "User NICKNAME already exists");
    } else if (newUser.email === userMatch.email) {
        throw new WarehouseError("User Error", "User EMAIL already exists");
    } else {
        throw new WarehouseError("User Error", "User DATA invalid");
    }
}

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

async function checkUserPassword(password, passwordConfirm) {
    if (password === "") {
        throw new WarehouseError("User Error", "User PASSWORD required");
    }
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
    let passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
}

async function validateNewUser(req, res, next) {
    // console.dir(req.body, { depth: null });
    // let newUser;

    const newUser = {
        fullName: checkUserFullname(req.body["user-fullName-input"]),
        username: checkUserUsername(req.body["user-username-input"]),
        nickname: checkUserNickname(req.body["user-nickname-input"]),
        email: checkUserEmail(req.body["user-email-input"]),
        branch: checkUserBranch(req.body["user-branch-input"]),
        role: checkUserRole(req.body["user-role-input"]),
        passwordHash: await checkUserPassword(
            req.body["user-password-input"],
            req.body["user-password-confirm-input"],
        ),
    };
    await checkUserInput(newUser);
    req.newUser = newUser;
    next();
}

export default validateNewUser;
