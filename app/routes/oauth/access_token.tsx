import {
  ActionFunction,
  json,
  LoaderFunction,
} from "@remix-run/server-runtime";
import { RateLimiter } from "limiter";
import { db } from "~/helpers/prisma.server";

const limiters = new Map<string, RateLimiter>();

export const loader: LoaderFunction = async ({ request }) => {
  return new Response("{}", {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
};
export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();
  const { grant_type, client_id, device_code } = body;
  if (grant_type === "device_code") {
    let limiter = limiters.get(`${client_id}-${device_code}`);
    if (!limiter) {
      // Request every 5 seconds
      limiter = new RateLimiter({ interval: "minute", tokensPerInterval: 20 });
      limiters.set(`${client_id}-${device_code}`, limiter);
    }
    if (!limiter.tryRemoveTokens(1)) {
      return json(
        {
          error: "slow_down",
          error_description: "You have exceeded the rate limit.",
        },
        {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 429,
        }
      );
    }
    const deviceRequest = await db.oAuthDeviceRequest.findFirst({
      where: {
        device_code: device_code,
      },
    });
    if (!deviceRequest) {
      return json(
        {
          error: "access_denied",
          error_description: "The device code is invalid or expired.",
        },
        {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 400,
        }
      );
    }
    if (deviceRequest.expires_at < new Date()) {
      await db.oAuthDeviceRequest.delete({
        where: {
          id: deviceRequest.id,
        },
      });
      return json(
        {
          error: "expired_token",
          error_description: "The device code has expired.",
        },
        {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 400,
        }
      );
    }
    if (deviceRequest.access_token) {
      const accessToken = await db.oAuthAccessToken.findFirst({
        where: {
          access_token: deviceRequest.access_token,
        },
      });
      await db.oAuthDeviceRequest.delete({
        where: {
          id: deviceRequest.id,
        },
      });
      if (!accessToken) {
        return json(
          {
            error: "access_denied",
            error_description: "The device code is invalid or expired.",
          },
          {
            headers: {
              "content-type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            status: 400,
          }
        );
      }

      return json(
        {
          access_token: accessToken.access_token,
          token_type: "bearer",
        },
        {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        }
      );
    }
    return json(
      {
        error: "authorization_pending",
        error_description:
          "The device code is valid but has not been approved yet.",
      },
      {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      }
    );
  }
  return json(
    {
      error: "invalid_request",
      error_description: "Invalid grant_type",
    },
    {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    }
  );
};
