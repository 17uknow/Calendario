import { continueRender, delayRender, staticFile } from "remotion";

export const SF_PRO_DISPLAY = "SF Pro Display";

let loaded = false;

export const ensureSfProLoaded = () => {
  if (loaded) return;
  loaded = true;

  const handle = delayRender("Loading SF Pro Display");

  const weights: [number, string][] = [
    [400, "SFPRODISPLAYREGULAR.OTF"],
    [500, "SFPRODISPLAYMEDIUM.OTF"],
    [700, "SFPRODISPLAYBOLD.OTF"],
  ];

  Promise.all(
    weights.map(([weight, file]) => {
      const fontFace = new FontFace(SF_PRO_DISPLAY, `url(${staticFile(`fonts/${file}`)})`, {
        weight: String(weight),
      });
      document.fonts.add(fontFace);
      return fontFace.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("Failed to load SF Pro Display", err);
      continueRender(handle);
    });
};
