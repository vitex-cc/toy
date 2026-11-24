export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Letters whose English names rhyme / sound alike. Challenge distractors are
// partly drawn from the same group so the question actually trains listening.
const SOUND_GROUPS = [
  ["B", "C", "D", "E", "G", "P", "T", "V", "Z"],
  ["A", "H", "J", "K"],
  ["F", "L", "M", "N", "S", "X"],
  ["I", "Y"],
  ["Q", "U", "W"],
  ["O", "R"],
];

function soundAlikes(letter) {
  const group = SOUND_GROUPS.find((g) => g.includes(letter)) || [];
  return group.filter((l) => l !== letter);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickFrom(pool, n, exclude) {
  return shuffle(pool.filter((l) => !exclude.includes(l))).slice(0, n);
}

// Shuffle-bag so every letter shows up once before any repeats, and the
// same letter never comes twice in a row across bag refills.
export function createLetterBag() {
  let bag = [];
  let last = null;
  return function next() {
    if (bag.length === 0) {
      bag = shuffle(LETTERS);
      if (bag[bag.length - 1] === last) bag.unshift(bag.pop());
    }
    last = bag.pop();
    return last;
  };
}

export function genLetterQuestion(answer, optionCount = 4) {
  const alikes = pickFrom(soundAlikes(answer), 2, [answer]);
  const rest = pickFrom(LETTERS, optionCount - 1 - alikes.length, [
    answer,
    ...alikes,
  ]);
  return {
    answer,
    options: shuffle([answer, ...alikes, ...rest]),
    id: Math.random().toString(36).slice(2, 8),
  };
}

// Every phrase here must have pre-generated audio in src/generated/tts-audio.js
// (run `npm run gen:tts` after editing).
export const LETTER_MESSAGES = {
  ask: ["听一听，是哪个字母？", "仔细听，找出这个字母～"],
  happy: [
    "答对啦！🎉",
    "真棒！你好聪明呀。",
    "完美！下一题冲冲冲！",
    "就知道这题难不倒你！",
  ],
  cheer: ["连对啦！继续加油！", "你是字母小达人！", "火力全开🔥"],
  wrong: ["差一点哦，正确答案是"],
};

export function pickLetterMsg(kind) {
  const arr = LETTER_MESSAGES[kind] || LETTER_MESSAGES.ask;
  return arr[Math.floor(Math.random() * arr.length)];
}
