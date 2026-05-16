import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import userQueries from "../models/db/users.js";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await userQueries.userQueryExact({
                username: username,
            });

            // check for invalid usename
            if (!user) {
                return done(null, false, {
                    message: "Username does not exist",
                });
            }

            // check for invalid password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: "Incorrect password" });
            }

            // check for inactive user
            if (user.status !== "ACTIVE") {
                return done(null, false, { message: "User Deactivated" });
            }

            // successfull login, return user
            return done(null, user);
        } catch (err) {
            console.log(err);
            done(err);
        }
    }),
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userQueries.userQueryExact({ id: id });
        done(null, user);
    } catch (err) {
        done(err);
    }
});
