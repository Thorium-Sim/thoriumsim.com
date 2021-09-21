import fs from "fs/promises";
import path from "path";
import graymatter from "gray-matter";
import {Post} from "@prisma/client";
import dotenv from "dotenv";
import {db} from "../app/helpers/prisma.server";
import {RateLimiter} from "limiter";
const b2limiter = new RateLimiter({tokensPerInterval: 1, interval: "sec"});
dotenv.config({path: "./.env"});
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/(\w)\'(\w)/g, "$1$2") // replace apostrophes
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[\s\W-]+/g, "-")
    .replace(/-$/, "");
}
const imgRegex = /^\!\[(.*)\]\((.*)\)/gm;
(async function migrate() {
  const basePath = "../nova.thoriumsim.com/content/posts";
  const folders = await fs.readdir("../nova.thoriumsim.com/content/posts");
  let count = 0;
  (
    await Promise.allSettled(
      folders.map(async (folder, i, arr) => {
        try {
          if ((await fs.lstat(path.join(basePath, folder))).isDirectory()) {
            const doc = await fs.readFile(
              path.join(basePath, folder, "index.md"),
              "utf-8"
            );
            const {data, content} = graymatter(doc) as any as {
              content: string;
              data: {
                title: string;
                author: string;
                date: string;
                hero: string | null;
                tags: string[];
                excerpt: string;
              };
            };
            const slug = slugify(data.title);
            let body = content;
            const imageMatches = content.matchAll(imgRegex);
            for (let [wholeString, altText, imagePath] of imageMatches) {
              const imageName = path.basename(imagePath);

              const fileName = `blog-images/${slug || ""}/${imageName.replace(
                /\s/gm,
                "-"
              )}`;
              const url = `https://files.thoriumsim.com/file/thorium-public/${fileName}`;
              body = body.replace(wholeString, `![${altText}](${url})`);
            }
            if (data.hero === "../../pages/landing/images/hero.jpg") {
              data.hero = null;
            }
            if (data.hero) {
              const imageName = path.basename(data.hero);

              const fileName = `blog-images/${
                slug || "unknown"
              }/${imageName.replace(/\s/gm, "-")}`;
              const url = `https://files.thoriumsim.com/file/thorium-public/${fileName}`;
              data.hero = url;
            }
            const post: Omit<Post, "post_id"> = {
              body,
              excerpt: data.excerpt,
              featuredImageUrl: data.hero,
              publishDate: new Date(data.date),
              published: true,
              slug,
              title: data.title,
              user_id: 1,
            };
            await b2limiter.removeTokens(1);

            await db.post.create({
              data: {
                ...post,
                ...(data.tags.length > 0
                  ? {
                      PostTag: {
                        create: data.tags.map(tag => ({
                          Tag: {
                            connectOrCreate: {where: {tag}, create: {tag}},
                          },
                        })),
                      },
                    }
                  : null),
              },
            });
          }
        } catch (err) {
          if (err instanceof Error) {
            throw {message: err.message, folder};
          } else {
            throw {err, folder};
          }
        }
      })
    )
  ).filter(t => t.status === "rejected");
})();
