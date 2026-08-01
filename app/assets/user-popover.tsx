import { clientEntry, css, type Handle } from "remix/ui";
import { FallbackImage } from "./fallback-image.tsx";
import * as menu from "remix/ui/menu/primitives";
import { routes } from "../routes.ts";
import { modalBackground } from "../ui/styles/modalBackground.ts";

export const UserPopover = clientEntry(
  import.meta.url,
  function UserPopover(
    handle: Handle<{
      user: { displayName: string; handle: string; avatar?: string; roles: string[] } | null;
    }>,
  ) {
    return () => {
      const { user } = handle.props;
      const isAdmin = user?.roles.includes("admin");

      if (!user)
        return (
          <a href={routes.auth.login.href()} mix={css({ textDecoration: "none" })} rmx-document>
            Login
          </a>
        );
      return (
        <menu.Context label="User Actions">
          <button
            mix={[
              css({
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                "&:focus-visible": {
                  outline: "2px solid light-dark(#3573f6, #6eaaff)",
                  outlineOffset: "2px",
                },
              }),
              menu.trigger({ placement: "bottom-end" }),
            ]}
            type="button"
          >
            <FallbackImage
              src={user?.avatar}
              mix={css({ width: "2.75rem", height: "2.75rem", borderRadius: "50%" })}
            />
          </button>

          <div mix={[surfaceCss, modalBackground, menu.popover()]}>
            <div mix={[listCss, menu.list()]}>
              <a
                href={routes.auth.profile.href()}
                mix={[
                  itemCss,
                  menu.item({ name: "profile" }),
                  css({
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textDecoration: "none",
                    padding: "6px 8px",
                  }),
                ]}
              >
                <FallbackImage
                  src={user?.avatar}
                  mix={css({ width: "2rem", height: "2rem", borderRadius: "50%", flexShrink: 0 })}
                />
                <div mix={css({ flexShrink: 1, overflow: "hidden" })}>
                  <p
                    mix={css({
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      width: "100%",
                    })}
                  >
                    {user?.displayName}
                  </p>
                  {user?.displayName !== user?.handle ? (
                    <p
                      mix={css({
                        margin: 0,
                        color: "rgb(255 255 255 / 0.7)",
                        textOverflow: "ellipsis",
                      })}
                    >
                      <small>@{user?.handle}</small>
                    </p>
                  ) : null}
                </div>
              </a>
              {isAdmin ? (
                <a
                  mix={[
                    itemCss,
                    menu.item({ name: "admin" }),
                    css({
                      textDecoration: "none",
                      padding: "6px 8px",
                    }),
                  ]}
                  href={routes.admin.index.href()}
                >
                  Admin
                </a>
              ) : null}
              <form
                action={routes.auth.logout.href()}
                method="POST"
                mix={[itemCss, menu.item({ name: "logout" })]}
              >
                <button
                  mix={css({
                    background: "transparent",
                    border: "none",
                    width: "100%",
                    height: "100%",
                    padding: "6px 8px",
                    textAlign: "left",
                  })}
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </menu.Context>
      );
    };
  },
);

const surfaceCss = css({
  boxSizing: "border-box",
  width: "14rem",
  margin: 0,
  padding: "8px",
  overflowX: "hidden",
  "&:popover-open": {
    display: "grid",
    gap: "8px",
  },
});

const listCss = css({
  display: "grid",
  gap: "2px",
  outline: 0,
  width: "100%",
});

const itemCss = css({
  fontSize: "0.8rem",
  borderRadius: "4px",
  color: "light-dark(#151515, #ececec)",
  letterSpacing: 0,
  minWidth: "0",
  '&[data-highlighted="true"]': {
    background: "light-dark(#eeeeee, #2c2c2c)",
  },
  '&[data-menu-flash="true"]': {
    background: "light-dark(#101010, #ececec)",
    color: "light-dark(#ffffff, #151515)",
  },
  '&[aria-disabled="true"]': {
    color: "light-dark(#9a9a9a, #666666)",
  },
});
