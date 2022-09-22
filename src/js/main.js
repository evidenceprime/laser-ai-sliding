import $ from 'cash-dom';

const RESOLUTION = {};
const UNIT = {};
const OFFSET = {};

const MIN_BLOCK_WIDTH = 2;
const MAX_BLOCK_WIDTH = 8;
const DEFAULT_UNIT_SIZE = 40;
const MAX_SLIDE_DELAY = 200;
const MAX_BLOCK_INTERVAL = 500;
const ADDITIONAL_DELAY = 1000;
const X_FILL = 1;
const Y_FILL = 1;

var IS_VISIBLE = true;

const COLORS = [
  '#7CA5C4',
  '#3C6CB0',
  '#2F4A81',
  '#EF844D',
];

var containerElement = null;
var observer = null;

const rows = [];

function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getRandomColor() {
  const index = getRandomInt(0, COLORS.length - 1);
  return COLORS[index];
};

function gaussianRand() {
  var rand = 0;

  for (var i = 0; i < 6; i += 1) {
    rand += Math.random();
  }

  return rand / 6;
}

function getGaussianRandomInt(start, end) {
  return Math.floor(start + gaussianRand() * (end - start + 1));
}

function resize() {
  RESOLUTION.x = window.innerWidth / DEFAULT_UNIT_SIZE * X_FILL;
  RESOLUTION.y = window.innerHeight / DEFAULT_UNIT_SIZE * Y_FILL;
  UNIT.x = 100 / RESOLUTION.x * X_FILL;
  UNIT.y = 100 / RESOLUTION.y * Y_FILL;
  OFFSET.x = Math.floor((window.innerWidth / DEFAULT_UNIT_SIZE - RESOLUTION.x)) / 2;
  OFFSET.y = Math.floor((window.innerHeight / DEFAULT_UNIT_SIZE - RESOLUTION.y)) / 2;
}


function appendBlock(rows) {
  const rowIndex = getRandomInt(0, RESOLUTION.y - 1);

  if (rows[rowIndex] === undefined) {
    rows[rowIndex] = {
      width: getRandomInt(0, RESOLUTION.x / 10),
      blocks: [],
    };
  }
  if (rows[rowIndex].width >= RESOLUTION.x / 3) return;

  const blockWidth = getRandomInt(MIN_BLOCK_WIDTH, MAX_BLOCK_WIDTH);
  const block = {
    index: rowIndex,
    element: $('<div class="block">').appendTo(containerElement),
    width: blockWidth,
    x: Math.floor((RESOLUTION.x - blockWidth) * Math.random() + RESOLUTION.x / 2),
    finalX: getGaussianRandomInt(0, RESOLUTION.x - blockWidth), //rows[rowIndex].width),
    y: rowIndex,
    transition: '.5s',
  };

  const initialOffset = block.width * Math.random();
  block.element.css({
    width: 0,
    height: UNIT.y + '%',
    top: UNIT.y * (block.y + OFFSET.y) + '%',
    left: UNIT.x * (block.x + OFFSET.x + initialOffset) + '%',
    backgroundColor: getRandomColor(),
  });

  rows[rowIndex].blocks.push(block);
  rows[rowIndex].width += block.width;
  return block;
}

function revealBlock(block) {
  block.element.css({
    width: UNIT.x * block.width + '%',
    left: UNIT.x * (block.x + OFFSET.x) + '%',
  });
}

function slideBlock(block) {
  block.element.css({
    left: UNIT.x * (block.finalX + OFFSET.x) + '%',
  });
}

function hideBlock(block) {
  if (Math.random() > 0.5) {
    block.element.css({
      opacity: 0,
    });
  } else {
    block.element.css({
      left: -(10 + block.width * UNIT.x) + '%',
    });
  }
}

function removeBlock(block) {
  block.element.remove();
}

function clearRows(filledRows) {
  if (filledRows.length >= RESOLUTION.y / 5) {
    filledRows.forEach(row => {
      row.blocks.forEach(block => {
        setTimeout(() => hideBlock(block), MAX_SLIDE_DELAY + ADDITIONAL_DELAY + 100);
        setTimeout(() => removeBlock(block), MAX_SLIDE_DELAY + ADDITIONAL_DELAY + 1000);
      });
      row.width = getRandomInt(0, RESOLUTION.x / 10);
      row.blocks = [];
    });
  }
}

function checkRows() {
  let filledRows = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      row === undefined ||
      (row.width < 6 && row.blocks.length < 2)
    ) {
      clearRows(filledRows);
      filledRows = [];
    } else {
      filledRows.push(row);
    }
  }
  clearRows(filledRows);
}

function play() {
  if (IS_VISIBLE) {
    const block = appendBlock(rows);
    if (block !== undefined) {
      const slideDelay = MAX_SLIDE_DELAY * Math.random() + 100 + ADDITIONAL_DELAY;

      setTimeout(() => revealBlock(block), 100);
      setTimeout(() => slideBlock(block), 500);
      setTimeout(() => slideBlock(block), slideDelay);
    }
    checkRows();
  }

  setTimeout(play, MAX_BLOCK_INTERVAL * Math.random());
}

function sliderSetup(elemName) {
  containerElement =$(elemName);
  
  observer = new IntersectionObserver(function(entries) {
    if(entries[0].isIntersecting === true) {
      IS_VISIBLE = true;
    }
    else {
      IS_VISIBLE = false;
    }
  }, { threshold: [0] });

  observer.observe(document.querySelector("#container"));
  window.addEventListener('resize', resize);

  resize(); 
  play();
}


