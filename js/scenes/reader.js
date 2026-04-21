// Reader — paged illustrated story.
// Every word on the page is a tappable <span> that speaks itself when
// pressed; "Read to me" reads the whole page aloud and highlights each
// word as it's spoken (via SpeechSynthesisUtterance.onboundary, with a
// timed fallback for browsers/stubs that don't fire boundary events).
// At the end of the book, 1-2 comprehension questions (phrase-to-picture)
// reinforce what the child just read.

import { getBook, BOOKS } from '../data/books.js';
import { buildScene } from '../characters/sceneArt.js';
import { buildKoala } from '../characters/koala.js';
import { attach as animate } from '../characters/animator.js';
import { buildStarCounter, rewardStar } from '../components/stars.js';
import { speak, cancelSpeech } from '../audio/speech.js';
import { success, tryAgain, tap as tapSound } from '../audio/sounds.js';

function markBookComplete(bookId) {
  try {
    const raw = globalThis.localStorage?.getItem('kpr.books') || '[]';
    const arr = JSON.parse(raw);
    if (!arr.includes(bookId)) arr.push(bookId);
    globalThis.localStorage?.setItem('kpr.books', JSON.stringify(arr));
  } catch (_) { /* noop */ }
}

function renderWordRun(text) {
  // Split text into word tokens and non-word separators, wrapping words
  // in tappable spans while preserving punctuation + whitespace.
  const frag = document.createDocumentFragment();
  const parts = text.match(/\w+['\w]*|[^\w]+/g) || [];
  const wordSpans = [];
  parts.forEach((part) => {
    if (/^\w/.test(part)) {
      const span = document.createElement('span');
      span.className = 'readable-word';
      span.textContent = part;
      span.dataset.word = part;
      span.tabIndex = 0;
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        tapSound();
        span.classList.add('is-highlight');
        speak(part);
        setTimeout(() => span.classList.remove('is-highlight'), 700);
      });
      frag.appendChild(span);
      wordSpans.push(span);
    } else {
      frag.appendChild(document.createTextNode(part));
    }
  });
  return { frag, wordSpans };
}

function readAloud(text, wordSpans) {
  // Delegate to the shared speak() helper so the reader uses the SAME voice
  // as every other mode (Samantha / Karen / Google US English / etc.)
  // instead of the OS default — which on many Linux setups is the robotic
  // espeak voice. The wordSpans are highlighted via the onBoundary callback
  // which speech.js synthesises from native boundary events when available
  // and from a timed fallback otherwise.
  const clearAll = () => wordSpans.forEach((s) => s.classList.remove('is-highlight'));
  clearAll();
  const cancel = speak(text, {
    onBoundary(idx) {
      clearAll();
      if (wordSpans[idx]) wordSpans[idx].classList.add('is-highlight');
    },
  });
  return () => { cancel(); clearAll(); };
}

export function mount(container, ctx, data = {}) {
  container.innerHTML = '';
  const bookId = data.bookId || (BOOKS[0] && BOOKS[0].id);
  const book = getBook(bookId);
  if (!book) {
    // Unknown book — bounce back to library.
    setTimeout(() => ctx.navigate('library'), 0);
    return () => {};
  }

  const scene = document.createElement('section');
  scene.className = 'scene reader';

  const top = document.createElement('div');
  top.className = 'topbar';
  const back = document.createElement('button');
  back.className = 'btn btn--ghost';
  back.textContent = '← Library';
  back.addEventListener('click', () => { tapSound(); ctx.navigate('library'); });
  top.appendChild(back);
  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = book.title;
  title.style.margin = '0';
  top.appendChild(title);
  top.appendChild(buildStarCounter());
  scene.appendChild(top);

  const page = document.createElement('div');
  page.className = 'book-page';
  scene.appendChild(page);

  const controls = document.createElement('div');
  controls.className = 'reader-controls';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn';
  prevBtn.textContent = '← Back';
  const readBtn = document.createElement('button');
  readBtn.className = 'btn btn--big';
  readBtn.textContent = '🔊 Read to me';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn';
  nextBtn.textContent = 'Next →';
  controls.appendChild(prevBtn);
  controls.appendChild(readBtn);
  controls.appendChild(nextBtn);
  scene.appendChild(controls);

  container.appendChild(scene);

  let currentIndex = 0;
  let stopReading = () => {};
  let narratorHandle = null;

  const totalPages = book.pages.length;

  const renderPage = (i) => {
    stopReading();
    page.innerHTML = '';

    const indicator = document.createElement('div');
    indicator.className = 'page-indicator';
    indicator.textContent = `Page ${i + 1} of ${totalPages}`;
    page.appendChild(indicator);

    const art = document.createElement('div');
    art.className = 'scene-card book-art';
    art.appendChild(buildScene(book.pages[i].sceneId));
    page.appendChild(art);

    // Tiny narrator koala peeks out of the bottom-left, reactive during reads.
    const narratorWrap = document.createElement('div');
    narratorWrap.className = 'narrator-slot';
    const narrator = buildKoala({ size: 'chibi', accessory: 'leaf' });
    narratorWrap.appendChild(narrator);
    art.appendChild(narratorWrap);
    if (narratorHandle) narratorHandle.detach();
    narratorHandle = animate(narrator);
    narratorHandle.setSpeaker(true);

    const pText = document.createElement('p');
    pText.className = 'page-text';
    const { frag, wordSpans } = renderWordRun(book.pages[i].text);
    pText.appendChild(frag);
    page.appendChild(pText);

    prevBtn.disabled = i === 0;
    nextBtn.textContent = i === totalPages - 1 ? 'Finish →' : 'Next →';

    // Auto-read each new page, with a short delay so the page has settled.
    setTimeout(() => { stopReading = readAloud(book.pages[i].text, wordSpans); }, 350);

    readBtn.onclick = () => {
      tapSound();
      stopReading = readAloud(book.pages[i].text, wordSpans);
    };
  };

  const showComprehension = () => {
    stopReading();
    page.innerHTML = '';
    controls.style.display = 'none';

    const cheer = document.createElement('h2');
    cheer.className = 'prompt';
    cheer.textContent = '🎉 Great reading!';
    page.appendChild(cheer);

    const qs = book.comprehension || [];
    let qIdx = 0;

    const renderQuestion = () => {
      page.innerHTML = '';
      const q = qs[qIdx];
      if (!q) {
        // All questions done — award star, mark book read, back to library.
        success();
        rewardStar();
        markBookComplete(book.id);
        speak('You read the book! Great job!');
        setTimeout(() => ctx.navigate('library'), 2400);
        return;
      }
      const h = document.createElement('h2');
      h.className = 'prompt';
      h.textContent = q.question;
      page.appendChild(h);

      const row = document.createElement('div');
      row.className = 'card-row';
      // Shuffle options so the correct one isn't always first.
      const shuffled = q.options.slice().sort(() => Math.random() - 0.5);
      shuffled.forEach((opt) => {
        const card = document.createElement('div');
        card.className = 'scene-card';
        card.setAttribute('role', 'button');
        card.dataset.sceneId = opt.sceneId;
        card.tabIndex = 0;
        card.appendChild(buildScene(opt.sceneId));
        card.addEventListener('click', () => {
          if (opt.correct) {
            success();
            rewardStar();
            speak('Yes!');
            qIdx++;
            setTimeout(renderQuestion, 1400);
          } else {
            tryAgain();
            card.animate && card.animate(
              [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }],
              { duration: 380 },
            );
            speak('Try the other one.');
          }
        });
        row.appendChild(card);
      });
      page.appendChild(row);
      setTimeout(() => speak(q.question), 250);
    };
    renderQuestion();
  };

  prevBtn.addEventListener('click', () => {
    tapSound();
    if (currentIndex > 0) { currentIndex--; renderPage(currentIndex); }
  });
  nextBtn.addEventListener('click', () => {
    tapSound();
    if (currentIndex < totalPages - 1) {
      currentIndex++;
      renderPage(currentIndex);
    } else {
      showComprehension();
    }
  });

  renderPage(0);

  return () => {
    stopReading();
    if (narratorHandle) narratorHandle.detach();
  };
}
