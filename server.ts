import { serve } from "https://deno.land/std@0.167.0/http/server.ts";

const workingDir = Deno.cwd();

let id = 1;

const images: { id: number; path: URL }[] = [];

for await (const dirEntry of Deno.readDir("./images")) {
  images.push({
    id: id++,
    path: new URL(`${workingDir}/images/${dirEntry.name}`, import.meta.url),
  });
}

const SPECIFIC_IMAGE_ROUTE = new URLPattern({ pathname: "/:id" });
const ROOT_IMAGE_ROUTE = new URLPattern({ pathname: "/" });

serve(async (req) => {
  const specificImage = SPECIFIC_IMAGE_ROUTE.exec(req.url);

  if (specificImage) {
    const id = +specificImage.pathname.groups.id;

    const result = images.find((image) => image.id === id);

    if (!result) {
      return new Response("Not found.", {
        status: 404,
      });
    }

    const response = await fetch(result.path);
    return new Response(response.body);
  }

  const rootRoute = ROOT_IMAGE_ROUTE.exec(req.url);

  if (rootRoute) {
    const randomPic = images[Math.floor(Math.random() * images.length)];
    const response = await fetch(randomPic.path);

    return new Response(response.body);
  }

  return new Response("Not found.", {
    status: 404,
  });
});
