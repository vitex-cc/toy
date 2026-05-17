export const ANIMALS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

function pickTwoDifferent() {
  const i = Math.floor(Math.random() * ANIMALS.length);
  let j = Math.floor(Math.random() * (ANIMALS.length - 1));
  if (j >= i) j += 1;
  return [ANIMALS[i], ANIMALS[j]];
}

export function genQuestion({ opMode, maxNumber }) {
  let op;
  if (opMode === "add") op = "+";
  else if (opMode === "sub") op = "-";
  else op = Math.random() < 0.5 ? "+" : "-";

  let a, b, answer;
  if (op === "+") {
    a = Math.floor(Math.random() * (maxNumber - 1)) + 1;
    b = Math.floor(Math.random() * (maxNumber - a)) + 1;
    answer = a + b;
  } else {
    a = Math.floor(Math.random() * (maxNumber - 1)) + 2;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  }

  let animalA, animalB;
  if (op === "+") {
    [animalA, animalB] = pickTwoDifferent();
  } else {
    animalA = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    animalB = null;
  }

  return { a, b, op, answer, animalA, animalB, id: Math.random().toString(36).slice(2, 8) };
}

export const MASCOT_MESSAGES = {
  idle: [
    "一起来算一算吧～",
    "你能算出来的！",
    "数数右边的小动物吧～",
    "慢慢数，不着急。",
  ],
  happy: [
    "答对啦！🎉",
    "真棒！你好聪明呀。",
    "完美！下一题冲冲冲！",
    "你好厲害～",
    "就知道这题难不倒你！",
  ],
  cheer: [
    "连对啦！继续加油！",
    "太厉害了！你是数学小天才！",
    "不可思议！你太棒了～",
    "火力全开🔥",
  ],
  sad: [
    "没关系，再试一下吧～",
    "差一点点哦，下题肯定能对！",
    "加油哦，小兔相信你。",
    "再想想看，你能行的！",
  ],
  wrong: [
    "差一点，我们换一题继续。",
    "这题先放过，下一题再赢回来！",
    "没答对也没关系，再练一次就更熟啦。",
    "小兔陪你继续试试！",
  ],
};

export function pickMsg(mood) {
  const arr = MASCOT_MESSAGES[mood] || MASCOT_MESSAGES.idle;
  return arr[Math.floor(Math.random() * arr.length)];
}
