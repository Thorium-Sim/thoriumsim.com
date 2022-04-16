import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/helpers/prisma.server";

export type { User } from "@prisma/client";

export async function getUserById(user_id: User["user_id"]) {
  const user = await prisma.user.findUnique({
    where: { user_id },
    include: { UserRole: { include: { Role: true } } },
  });

  const roles = user?.UserRole.flatMap((userRole) => userRole.Role?.name);
  return { ...user, roles };
}
export async function getUserByEmail(email: User["email"]) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { UserRole: { include: { Role: true } } },
  });

  const roles = user?.UserRole.flatMap((userRole) => userRole.Role?.name);
  return { ...user, roles };
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(email: User["email"], password: string) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: { UserRole: { include: { Role: true } } },
  });

  const roles = userWithPassword?.UserRole.flatMap(
    (userRole) => userRole.Role?.name
  );
  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return { ...userWithoutPassword, roles };
}
