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

serve(async () => {
  const randomPic = images[Math.floor(Math.random() * images.length)];
  const response = await fetch(randomPic.path);

  return new Response(response.body);
});
