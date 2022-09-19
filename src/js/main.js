import $ from 'cash-dom';

// size of the field
const RESOLUTION = {
  x: 64,
  y: 36,
};

// size of the final rectangle
const SIZE = {
  x: 16,
  y: 10,
};

const MAX_REVEAL_DELAY = 2000;
const MAX_SLIDE_DELAY = 2000;
const SLIDE_REVEAL_TIME_GAP = 100;

const COLORS = [
  '#7CA5C4',
  '#3C6CB0',
  '#2F4A81',
  '#EF844D',
];

const containerElement = $('#container');
let MIN_BLOCK_WIDTH = 3; // some blocks might be shorter if needed
let MAX_BLOCK_WIDTH = 8; // absolute limit

function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getRandomColor() {
  const index = getRandomInt(0, COLORS.length - 1);
  return COLORS[index];
};

function resize() {
  const containerSize = {};
  if (RESOLUTION.x / RESOLUTION.y > window.innerWidth / window.innerHeight) {
    containerSize.width = window.innerWidth * 0.95;
    containerSize.height = containerSize.width * RESOLUTION.y / RESOLUTION.x;
  } else {
    containerSize.height = window.innerHeight * 0.95;
    containerSize.width = containerSize.height * RESOLUTION.x / RESOLUTION.y;
  }
  containerElement.css(containerSize);
}

function getNextBlockWidth(widthLeft) {
  let blockWidth;

  if (widthLeft < 2 * MIN_BLOCK_WIDTH) {
    if (widthLeft < MAX_BLOCK_WIDTH) {
      blockWidth = widthLeft;
    } else {
      blockWidth = MIN_BLOCK_WIDTH;
    }
  } else {
    blockWidth = getRandomInt(MIN_BLOCK_WIDTH, MAX_BLOCK_WIDTH);

    if (
      widthLeft - blockWidth < MIN_BLOCK_WIDTH
    ) {
      if (widthLeft < MAX_BLOCK_WIDTH) {
        blockWidth = widthLeft;
      } else {
        while (
          widthLeft - blockWidth < MIN_BLOCK_WIDTH &&
          blockWidth > MIN_BLOCK_WIDTH
        ) {
          blockWidth -= 1;
        }
      }
    }
  }

  return Math.min(widthLeft, blockWidth);
}

function appendBlock(row, widthLeft, rowIndex) {
  const blockWidth = getNextBlockWidth(widthLeft);
  const block = {
    element: $('<div class="block">').appendTo(containerElement),
    width: blockWidth,
    x: SIZE.x - widthLeft, // final position
    y: rowIndex,
  };

  row.push(block);
  return blockWidth;
}

function setInitialBlockPosition(block, params, spread, spreadLeft) {
  const left = block.x + spread;
  const initialOffset = block.width * Math.random(); // offset before reveal
  block.initialX = left + RESOLUTION.x - SIZE.x - spreadLeft; // position after reveal

  block.element.css({
    top: params.unit.y * (block.y + params.offset.y) + '%',
    left: params.unit.x * (block.initialX + initialOffset) + '%',
    width: 0,
    height: params.unit.y + '%',
    backgroundColor: getRandomColor(params),
  });
}

function revealBlock(block, params) {
  block.element.css({
    width: params.unit.x * block.width + '%',
    left: params.unit.x * block.initialX + '%',
  });
}

function slideBlock(block, params) {
  block.element.css({
    left: params.unit.x * (block.x + params.offset.x) + '%',
  });
}

function setBlockAnimations(block, position, spreadLeft, params) {
  const spaceBeforeBlock = Math.min(Math.floor(2 * spreadLeft / (position + 1) * Math.random()), spreadLeft);
  const revealDelay = MAX_REVEAL_DELAY * Math.random();
  const slideDelay = Math.max(MAX_REVEAL_DELAY + MAX_SLIDE_DELAY * Math.random() + SLIDE_REVEAL_TIME_GAP, revealDelay);

  setInitialBlockPosition(block, params, spaceBeforeBlock, spreadLeft);
  setTimeout(() => revealBlock(block, params), revealDelay);
  setTimeout(() => slideBlock(block, params), slideDelay);

  return spaceBeforeBlock;
}

function getCurrentAnimationParameters() {
  return {
    saturation: getRandomInt(40, 80),
    lightness: getRandomInt(50, 70),

    // size of the single square
    unit: {
      x: 100 / RESOLUTION.x,
      y: 100 / RESOLUTION.y,
    },

    // offset to center the rectangle
    offset: {
      x: (RESOLUTION.x - SIZE.x) / 2,
      y: (RESOLUTION.y - SIZE.y) / 2,
    }
  };
}

function play() {
  containerElement.empty();
  resize();

  const params = getCurrentAnimationParameters();

  for (let y = 0; y < SIZE.y; y++) {
    const row = [];
    let widthLeft = SIZE.x;

    while (widthLeft > 0) {
      const blockWidth = appendBlock(row, widthLeft, y);
      widthLeft -= blockWidth;
    }

    let spreadLeft = RESOLUTION.x - SIZE.x;

    row.forEach((block, index) => {
      const spread = setBlockAnimations(block, row.length - index, spreadLeft, params);
      spreadLeft -= spread;
    });
  }
}

window.addEventListener('resize', resize);
$('#settings input').on('input', play);
$('#settings').on('click', event => event.stopPropagation());
document.addEventListener('click', play);

play();