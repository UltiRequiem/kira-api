import { serve } from "https://deno.land/std@0.167.0/http/server.ts";

const images = await loadFiles("images");

const routes = {
  root: new URLPattern({ pathname: "/" }),
  docs: new URLPattern({ pathname: "/docs" }),
  statistics: new URLPattern({ pathname: "/statistics" }),
  specific: new URLPattern({ pathname: "/:id" }),
};

async function serverHandler({ url }: Request) {
  if (routes.root.exec(url)) {
    const randomPic = images[Math.floor(Math.random() * images.length)];
    const response = await fetch(randomPic.path);

    return new Response(response.body);
  }

  if (routes.docs.exec(url)) {
    return Response.redirect("https://github.com/UltiRequiem/kira-api");
  }

  if (routes.statistics.exec(url)) {
    return Response.json({ totalImages: images.length, images });
  }

  const specific = routes.specific.exec(url);

  if (specific) {
    const id = parseInt(specific.pathname.groups.id);

    const result = images.find((image) => image.id === id);

    if (!result) {
      return Response.json(
        { error: "Not found (try /statistics)" },
        { status: 404 },
      );
    }

    const response = await fetch(result.path);
    return new Response(response.body);
  }

  return new Response(undefined, { status: 404 });
}

serve(serverHandler);

async function loadFiles(dir: string) {
  let id = 1;

  const files: { id: number; path: URL }[] = [];

  for await (const dirEntry of Deno.readDir(`./${dir}`)) {
    const path = new URL(`./${dir}/${dirEntry.name}`, import.meta.url);

    files.push({ id: id++, path });
  }

  return files;
}
