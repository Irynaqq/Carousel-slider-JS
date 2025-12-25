// Константи
const CODE_ARROW_LEFT = 'ArrowLeft';
const CODE_ARROW_RIGHT = 'ArrowRight';
const CODE_SPACE = 'Space';
const FA_PAUSE = '<i class="fas fa-pause"></i>';
const FA_PLAY = '<i class="fas fa-play"></i>';
const TIMER_INTERVAL = 2000;
const SWIPE_THRESHOLD = 60; // было 100 — слишком много для мобилки

// DOM
const slidesContainer = document.querySelector('#slides-container');
const slides = Array.from(document.querySelectorAll('.slide'));
const indicatorsContainer = document.querySelector('#indicators-container');
const indicators = Array.from(document.querySelectorAll('.indicator'));
const pauseBtn = document.querySelector('#pause-btn');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');

const SLIDES_COUNT = slides.length;

// State
let currentSlide = 0;
let isPlaying = true;
let timerId = null;
let swipeStartX = null;

// Utils
function clampIndex(i) {
  // безопасно для любых входных значений
  return (i + SLIDES_COUNT) % SLIDES_COUNT;
}

function clearTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  clearTimer();
  timerId = setInterval(nextSlide, TIMER_INTERVAL);
}

// Core
function goToSlide(index) {
  const next = clampIndex(index);
  if (next === currentSlide) return;

  slides[currentSlide]?.classList.remove('active');
  indicators[currentSlide]?.classList.remove('active');

  currentSlide = next;

  slides[currentSlide]?.classList.add('active');
  indicators[currentSlide]?.classList.add('active');
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

// Autoplay
function startAutoPlay() {
  if (isPlaying) return;
  isPlaying = true;
  pauseBtn.innerHTML = FA_PAUSE;
  startTimer();
}

function stopAutoPlay() {
  if (!isPlaying) return;
  isPlaying = false;
  pauseBtn.innerHTML = FA_PLAY;
  clearTimer();
}

function pausePlayHandler() {
  isPlaying ? stopAutoPlay() : startAutoPlay();
}

// Buttons
function nextHandler() {
  nextSlide();
  stopAutoPlay();
}

function prevHandler() {
  prevSlide();
  stopAutoPlay();
}

// Indicators
function indicatorClickHandler(event) {
  const btn = event.target.closest('.indicator');
  if (!btn) return;

  const slideIndex = Number(btn.dataset.slideTo);
  if (Number.isNaN(slideIndex)) return;

  goToSlide(slideIndex);
  stopAutoPlay();
}

// Keyboard
function keydownHandler(event) {
  if (event.code === CODE_ARROW_LEFT) {
    prevHandler();
  } else if (event.code === CODE_ARROW_RIGHT) {
    nextHandler();
  } else if (event.code === CODE_SPACE) {
    event.preventDefault();
    pausePlayHandler();
  }
}

// Swipe helpers (без TouchEvent instanceof)
function getClientX(e) {
  if (e.touches && e.touches[0]) return e.touches[0].clientX;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
  return e.clientX;
}

function swipeStartHandler(event) {
  // чтобы не было выделения текста/скачков на мобилке
  event.preventDefault?.();
  swipeStartX = getClientX(event);
}

function swipeEndHandler(event) {
  if (swipeStartX === null) return;

  const endX = getClientX(event);
  const dx = endX - swipeStartX;

  if (dx > SWIPE_THRESHOLD) prevHandler();
  else if (dx < -SWIPE_THRESHOLD) nextHandler();

  swipeStartX = null;
}

// Pause when tab hidden (убирает “догоняющий” лаг)
function visibilityHandler() {
  if (document.hidden) {
    clearTimer();
  } else if (isPlaying) {
    startTimer();
  }
}

// Init
function init() {
  if (!SLIDES_COUNT || indicators.length !== SLIDES_COUNT) {
    console.warn('Slides/indicators mismatch:', SLIDES_COUNT, indicators.length);
  }

  pauseBtn.addEventListener('click', pausePlayHandler);
  prevBtn.addEventListener('click', prevHandler);
  nextBtn.addEventListener('click', nextHandler);

  indicatorsContainer.addEventListener('click', indicatorClickHandler);
  document.addEventListener('keydown', keydownHandler);
  document.addEventListener('visibilitychange', visibilityHandler);

  // Swipe: лучше pointer events, но оставим твою схему + чуть укрепим
  slidesContainer.addEventListener('mousedown', swipeStartHandler);
  slidesContainer.addEventListener('mouseup', swipeEndHandler);

  slidesContainer.addEventListener('touchstart', swipeStartHandler, { passive: false });
  slidesContainer.addEventListener('touchend', swipeEndHandler);

  // autoplay старт
  isPlaying = true;
  pauseBtn.innerHTML = FA_PAUSE;
  startTimer();
}

init();
