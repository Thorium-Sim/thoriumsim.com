import { json, LoaderFunction } from "@remix-run/server-runtime";
import { db } from "~/helpers/prisma.server";
import { validateToken } from "~/validateToken";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};
export const loader: LoaderFunction = async ({ request }) => {
  const { user_id } = await validateToken(request, ["identity"]);
  if (request.method === "GET") {
    const coreLayouts = await db.coreLayout.findMany({
      where: {
        user_id,
        deleted: false,
      },
    });

    return json(
      {
        coreLayouts,
      },
      {
        headers,
      }
    );
  }
  if (request.method === "POST") {
    const body = await request.json();

    const record = await db.coreLayout.create({
      data: {
        ...body,
        user_id,
      },
    });

    return json(
      { coreLayout: record },
      {
        headers,
      }
    );
  }
  if (request.method === "PUT") {
    const body = await request.json();

    const record = await db.coreLayout.update({
      where: {
        id: body.id,
      },
      data: {
        ...body,
        user_id,
      },
    });

    return json(
      { coreLayout: record },
      {
        headers,
      }
    );
  }
  if (request.method === "DELETE") {
    const body = await request.json();

    const record = await db.coreLayout.update({
      where: {
        id: body.id,
      },
      data: {
        deleted: true,
      },
    });

    return json(
      { coreLayout: record },
      {
        headers,
      }
    );
  }

  return json(
    {},
    {
      headers,
    }
  );
};
