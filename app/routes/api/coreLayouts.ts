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
  if (request.method === "GET") {
    const { user_id } = await validateToken(request, []);
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
    const { user_id } = await validateToken(request, []);
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
    const { user_id } = await validateToken(request, []);
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
    await validateToken(request, []);
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
