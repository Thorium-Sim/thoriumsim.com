import {Form, usePendingFormSubmit, useRouteData} from "@remix-run/react";
import {FormEvent, useRef, useState} from "react";
import {FaSpinner, FaUser} from "react-icons/fa";
import {Input} from "../../components/Input";
import {useUser} from "../../context/user";
import {getUploadUrl} from "../../helpers/b2";
import {ActionFunction, LoaderFunction, redirect} from "remix";
import {commitSession, getSession} from "~/auth/localSession.server";
import {authenticator} from "~/auth/auth.server";
import {db} from "~/helpers/prisma.server";
import {User} from "@prisma/client";

interface ProfileData {
  authorizationToken: string;
  bucketId: string;
  uploadUrl: string;
}
export const loader: LoaderFunction = async () => {
  const uploadData = await getUploadUrl();
  return uploadData;
};

export const action: ActionFunction = async ({params, request, context}) => {
  let session = await getSession(request.headers.get("Cookie") || "");
  const user = session.get("user") as User;
  let {displayName, email, bio, profilePictureUrl} = Object.fromEntries(
    new URLSearchParams(await request.text())
  );
  try {
    const newUser = await db.user.update({
      where: {user_id: user.user_id},
      data: {displayName, email, bio, profilePictureUrl},
    });
    session.set(authenticator.sessionKey, newUser);
    return redirect("/profile", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      session.flash("error", err.message);
    }
    return redirect("/profile", {
      headers: {"set-cookie": await commitSession(session)},
    });
  }
};
export default function Profile() {
  const {uploadUrl, authorizationToken} = useRouteData<ProfileData>();
  const user = useUser();
  const [formPending, setFormPending] = useState(false);
  const pendingForm = usePendingFormSubmit();
  const [fileImage, setFileImage] = useState(user?.profilePictureUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="max-w-prose w-full mx-auto my-32">
      <h1 className="font-bold text-4xl mb-8">Profile</h1>
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
            }).then(res => res.json());
            const {fileName} = result;
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
          <label className="w-48 h-48 ml-8 text-grey-200 text-sm font-bold cursor-pointer">
            <div className="mb-4 text-center">Profile Picture</div>
            {user?.profilePictureUrl || fileImage ? (
              <img
                draggable={false}
                src={fileImage || user?.profilePictureUrl || ""}
                className="rounded-full w-full h-full object-contain"
              />
            ) : (
              <div className="rounded-full h-48 w-48 bg-tgray-400 flex justify-center items-center cursor-pointer hover:bg-tgray-300 transition-colors">
                <FaUser className="text-9xl" />
              </div>
            )}
            <input
              type="file"
              ref={fileRef}
              hidden
              onChange={event => {
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
          className="bg-thorium-500 hover:bg-thorium-600 disabled:bg-tgray-200 text-white  disabled:cursor-not-allowed font-bold py-2 px-4 rounded"
          disabled={formPending || !!pendingForm}
        >
          {formPending || pendingForm ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Update Profile"
          )}
        </button>
      </Form>
    </div>
  );
}
