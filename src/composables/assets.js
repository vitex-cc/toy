const animalModules = import.meta.glob("../assets/animals/*.png", {
  eager: true,
  query: "?inline",
  import: "default",
});

const mascotModules = import.meta.glob("../assets/mascot/*.png", {
  eager: true,
  query: "?inline",
  import: "default",
});

function keyFromPath(path) {
  return path.split("/").pop().replace(/\.[^.]+$/, "");
}

const animalImages = Object.fromEntries(
  Object.entries(animalModules).map(([path, src]) => [keyFromPath(path), src])
);

const mascotImages = Object.fromEntries(
  Object.entries(mascotModules).map(([path, src]) => [keyFromPath(path), src])
);

export function animalImageSrc(id) {
  return animalImages[id];
}

export function mascotImageSrc(mood) {
  return mascotImages[mood];
}
