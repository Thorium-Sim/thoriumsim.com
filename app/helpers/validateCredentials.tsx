import {db} from "~/helpers/prisma.server";

export async function validateCredentials(
  displayName: string | null,
  email: string | null,
  password: string | null
) {
  if (!displayName)
    throw {type: "displayName", message: "Display Name must not be blank."};
  if (!email) throw {type: "email", message: "Email must not be blank."};
  if (!password)
    throw {type: "password", message: "Password must not be blank."};
  if (password.length < 8)
    throw {
      type: "password",
      message: "Password must be at least 8 characters long.",
    };
  const {default: bcrypt} = await import("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  // now we set user password to hashed password
  const newPassword = await bcrypt.hash(password, salt);

  try {
    // First create a new user; this will throw if there is a failure.
    return await db.user.create({
      data: {email, password: newPassword, displayName},
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint failed on the fields: (`email`)")
    ) {
      throw {type: "email", message: "Email address already exists."};
    } else {
      throw err;
    }
  }
}
