import { Form, useTransition, useLoaderData } from "@remix-run/react";
import React, { FormEvent, useRef, useState } from "react";
import { FaDiscord, FaGithub, FaSpinner, FaUser } from "react-icons/fa";
import { Input } from "~/components/Input";
import { useUser } from "~/context/user";
import { getUploadUrl } from "~/helpers/b2";
import { db } from "~/helpers/prisma.server";
import { User } from "@prisma/client";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import {
  commitSession,
  createUserSession,
  getSession,
  getUser,
} from "~/session.server";

function ProfileButton({
  provider,
  title,
  icon,
  className,
}: {
  provider: string;
  title: string;
  className: string;
  icon: React.ReactElement;
}) {
  const pendingForm = useTransition().submission;
  const { connectedProviders } = useLoaderData<ProfileData>();
  return connectedProviders.includes(provider) ? (
    <Form method="delete" className="flex items-center">
      {icon}
      <div className="mx-4">Connected to {title}</div>
      <button
        className="flex items-center rounded bg-red-700 py-2 px-4 font-bold text-white hover:bg-red-500 disabled:bg-red-800"
        disabled={!!pendingForm}
      >
        {pendingForm?.method === "DELETE" &&
        pendingForm.formData.get("type") === "provider" ? (
          <FaSpinner className="animate-spin" />
        ) : (
          "Disconnect"
        )}
      </button>
      <input type="hidden" name="type" value={provider} />
    </Form>
  ) : (
    <Form action={`/webhooks/connectAccount?type=${provider}`} method="post">
      <button
        className={`${className} flex items-center rounded py-2 px-4 font-bold`}
      >
        <div className="mr-4">
          {pendingForm?.action ===
          `/webhooks/connectAccount?type=${provider}` ? (
            <FaSpinner className="animate-spin" />
          ) : (
            `Connect with ${title}`
          )}
        </div>
        {icon}
      </button>
    </Form>
  );
}
interface ProfileData {
  authorizationToken: string;
  bucketId: string;
  uploadUrl: string;
  connectedProviders: string[];
}
export const loader: LoaderFunction = async ({ request }) => {
  const uploadData = await getUploadUrl();
  const user = await getUser(request);

  if (!user) {
    return redirect("/login");
  }
  const connectedAccounts = await db.connectedAccount.findMany({
    where: {
      user_id: user?.user_id || -1,
    },
  });
  const connectedProviders = connectedAccounts.map((account) => account.type);
  return { ...uploadData, connectedProviders };
};

export const action: ActionFunction = async ({ request }) => {
  let session = await getSession(request);
  const user = await getUser(request);

  if (!user) throw new Error("User not found");

  let {
    displayName,
    email,
    bio,
    profilePictureUrl,
    password,
    newPassword,
    confirmNewPassword,
    type,
  } = Object.fromEntries(new URLSearchParams(await request.text()));

  try {
    if (request.method.toLowerCase() === "delete") {
      await db.connectedAccount.deleteMany({
        where: {
          user_id: user.user_id,
          type: type,
        },
      });
      return redirect("/profile", {
        headers: { "set-cookie": await commitSession(session) },
      });
    }
    if (password) {
      if (!password) {
        throw new Error("Password is required");
      }

      const userRecord = await db.user.findFirst({
        where: { user_id: user.user_id },
      });
      if (!userRecord) {
        throw new Error("User not found");
      }
      const { default: bcrypt } = await import("bcryptjs");
      const validPassword = await bcrypt.compare(password, userRecord.password);
      if (!validPassword) throw new Error("Invalid password");

      if (newPassword && confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new Error("New password does not match");
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        const { password, ...newUser } = await db.user.update({
          where: { user_id: user.user_id },
          data: { password: hash },
        });
        session.flash("toast", "Password updated.");
        await createUserSession({
          request,
          userId: newUser.user_id,
          remember: true,
          redirectTo: "/profile",
        });
      }
    } else {
      const { password, ...newUser } = await db.user.update({
        where: { user_id: user.user_id },
        data: { displayName, email, bio, profilePictureUrl },
      });
      await createUserSession({
        request,
        userId: newUser.user_id,
        remember: true,
        redirectTo: "/profile",
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      session.flash("error", err.message);
    }
    return redirect("/profile", {
      headers: { "set-cookie": await commitSession(session) },
    });
  }
};
export default function Profile() {
  const { uploadUrl, authorizationToken } = useLoaderData<ProfileData>();
  const user = useUser();
  const [formPending, setFormPending] = useState(false);
  const pendingForm = useTransition().submission;
  const [fileImage, setFileImage] = useState(user?.profilePictureUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mx-auto my-32 w-full max-w-prose">
      <h1 className="mb-8 text-4xl font-bold">Profile</h1>
      <Form
        method="post"
        onSubmit={async (e: FormEvent) => {
          e.preventDefault();
          setFormPending(true);
          const target = e.target as HTMLFormElement & {
            file: HTMLInputElement;
          };
          const image = fileRef.current?.files?.[0];
          if (image) {
            const result = await fetch(uploadUrl, {
              method: "POST",
              body: image,
              headers: {
                Authorization: authorizationToken,
                "Content-Type": "b2/x-auto",
                "X-Bz-File-Name": `user-images/${
                  user?.email || ""
                }/${image.name.replace(/\s/gm, "-")}`,
                "X-Bz-Content-Sha1": "do_not_verify",
              },
            }).then((res) => res.json());
            const { fileName } = result;
            const url = `https://files.thoriumsim.com/file/thorium-public/${fileName}`;
            target.profilePictureUrl.value = url;
          }

          target.submit();
          setFormPending(true);
        }}
      >
        <div className="flex">
          <div className="flex-1">
            <Input
              label="Display Name"
              name="displayName"
              defaultValue={user?.displayName || ""}
            />
            <Input
              label="Email"
              type="email"
              readOnly
              defaultValue={user?.email}
            />
            <Input
              label="Bio"
              as="textarea"
              name="bio"
              rows={5}
              defaultValue={user?.bio || ""}
            />
            <input
              type="hidden"
              name="profilePictureUrl"
              value={user?.profilePictureUrl || ""}
            />
          </div>
          <label className="text-grey-200 ml-8 h-48 w-48 cursor-pointer text-sm font-bold">
            <div className="mb-4 text-center">Profile Picture</div>
            {user?.profilePictureUrl || fileImage ? (
              <img
                draggable={false}
                src={fileImage || user?.profilePictureUrl || ""}
                className="h-full w-full rounded-full object-contain"
              />
            ) : (
              <div className="flex h-48 w-48 cursor-pointer items-center justify-center rounded-full bg-tgray-400 transition-colors hover:bg-tgray-300">
                <FaUser className="text-9xl" />
              </div>
            )}
            <input
              type="file"
              ref={fileRef}
              hidden
              onChange={(event) => {
                const fileReader = new FileReader();
                fileReader.onload = () => {
                  if (typeof fileReader.result === "string") {
                    setFileImage(fileReader.result);
                  }
                };
                if (event.currentTarget.files?.[0]) {
                  fileReader.readAsDataURL(event.currentTarget.files[0]);
                }
              }}
            />
          </label>
        </div>
        <button
          className="rounded bg-thorium-500 py-2 px-4  font-bold text-white hover:bg-thorium-600 disabled:cursor-not-allowed disabled:bg-tgray-200"
          disabled={formPending || !!pendingForm}
        >
          {formPending ||
          (pendingForm &&
            !pendingForm?.formData.get("password") &&
            !pendingForm.action.startsWith("/webhooks/connectAccount?type=") &&
            pendingForm.method !== "DELETE") ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Update Profile"
          )}
        </button>
      </Form>
      <div className="h-16" />
      <h3 className="mb-2 text-2xl font-extrabold">Connected Accounts</h3>
      <div className="space-y-2">
        <ProfileButton
          provider="github"
          title="Github"
          icon={<FaGithub />}
          className="bg-warmGray-900 hover:bg-warmGray-800 text-white"
        />
        <ProfileButton
          provider="discord"
          title="Discord"
          icon={<FaDiscord />}
          className="bg-[#5865F2] text-white hover:bg-[#8791f6]"
        />
      </div>
      <div className="h-16" />
      <Form
        method="post"
        onSubmit={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex">
          <div className="flex-1">
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Password"
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="New Password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm New Password"
            />
          </div>
          <div className="ml-8 h-48 w-48" />
        </div>

        <button
          className="rounded bg-thorium-500 py-2 px-4  font-bold text-white hover:bg-thorium-600 disabled:cursor-not-allowed disabled:bg-tgray-200"
          disabled={formPending || !!pendingForm}
        >
          {pendingForm?.formData.get("password") &&
          pendingForm.method !== "DELETE" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Update Password"
          )}
        </button>
      </Form>
    </div>
  );
}
