// Reader — paged illustrated story.
// Every word on the page is a tappable <span> that speaks itself when
// pressed; "Read to me" reads the whole page aloud and highlights each
// word as it's spoken (via SpeechSynthesisUtterance.onboundary, with a
// timed fallback for browsers/stubs that don't fire boundary events).
// At the end of the book, 1-2 comprehension questions (phrase-to-picture)
// reinforce what the child just read.

import { getBook, BOOKS } from '../data/books.js';
import { buildScene } from '../characters/sceneArt.js';
import { buildKoala } from '../characters/koala.js?v=7';
import { buildBuddy } from '../components/buddy.js?v=7';
import { attach as animate } from '../characters/animator.js';
import { makeSceneInteractive } from '../characters/interactive.js';
import { buildStarCounter, rewardStar } from '../components/stars.js';
import { bumpStat, getStats } from '../components/badges.js';
import { speak, cancelSpeech } from '../audio/speech.js';
import { success, tryAgain, tap as tapSound } from '../audio/sounds.js';

const KEY_PAGE_READS = 'kpr.pageReads';   // { "<bookId>:<idx>": readCount }
const MASTERED_AT    = 3;                  // re-reading is the #1 fluency intervention

function loadPageReads() {
  try { return JSON.parse(globalThis.localStorage?.getItem(KEY_PAGE_READS) || '{}'); }
  catch (_) { return {}; }
}
function bumpPageRead(bookId, idx) {
  const all = loadPageReads();
  const k = `${bookId}:${idx}`;
  const prev = all[k] || 0;
  all[k] = prev + 1;
  try { globalThis.localStorage?.setItem(KEY_PAGE_READS, JSON.stringify(all)); }
  catch (_) { /* noop */ }
  // When this page crosses the mastery threshold, mirror to the badges
  // stat so Master Reader can fire.
  if (prev + 1 === MASTERED_AT) {
    bumpStat('pagesMastered', 1);
  }
  return all[k];
}
export function getPageReadCount(bookId, idx) {
  return loadPageReads()[`${bookId}:${idx}`] || 0;
}

function markBookComplete(bookId) {
  try {
    const raw = globalThis.localStorage?.getItem('kpr.books') || '[]';
    const arr = JSON.parse(raw);
    const wasNew = !arr.includes(bookId);
    if (wasNew) {
      arr.push(bookId);
      globalThis.localStorage?.setItem('kpr.books', JSON.stringify(arr));
      bumpStat('booksRead', 1);
    }
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
        bumpStat('wordsTapped', 1);
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
  let interactiveCleanup = null;

  const totalPages = book.pages.length;

  const renderPage = (i) => {
    stopReading();
    page.innerHTML = '';

    // Bump per-page read count and fire mastery cues. Re-reading is the
    // #1 evidence-backed fluency intervention for early elementary, so
    // we encourage it visually.
    const reads = bumpPageRead(book.id, i);
    const isMastered = reads >= MASTERED_AT;

    const indicator = document.createElement('div');
    indicator.className = 'page-indicator';
    const dots = '●'.repeat(Math.min(reads, MASTERED_AT)) + '○'.repeat(Math.max(0, MASTERED_AT - reads));
    indicator.textContent = `Page ${i + 1} of ${totalPages}   ${dots}${isMastered ? '  🏆 Mastered!' : ''}`;
    page.appendChild(indicator);

    const art = document.createElement('div');
    art.className = 'scene-card book-art' + (isMastered ? ' is-mastered' : '');
    const sceneSvg = buildScene(book.pages[i].sceneId);
    art.appendChild(sceneSvg);
    page.appendChild(art);
    // Every character + prop in the scene becomes tappable. Tapping the
    // panda speaks "panda", tapping the sun speaks "sun", etc.
    if (interactiveCleanup) interactiveCleanup();
    interactiveCleanup = makeSceneInteractive(sceneSvg);

    // Tiny narrator buddy peeks out of the bottom-left, reactive during reads.
    // Phase B: this is the kid's chosen buddy. The CSS class
    // .narrator-koala is preserved so existing tests continue to find the
    // narrator slot regardless of species.
    const narratorWrap = document.createElement('div');
    narratorWrap.className = 'narrator-slot';
    const narrator = buildBuddy({ size: 'chibi' });
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

    // Choose-your-own-adventure: if this page has a `choice`, render the
    // question + option buttons under the text. Picking one renders the
    // chosen branch as a transient page, then advances to the next regular
    // page on Next.
    if (book.pages[i].choice) {
      renderChoice(book.pages[i].choice);
    }
  };

  // Render the choice question + option buttons inside the current page.
  // Tapping an option swaps the page text + scene art with the chosen
  // branch (still on the same page index) so the child reads the
  // resulting sentence. Next then advances to the next regular page.
  const renderChoice = (choice) => {
    const choicePanel = document.createElement('div');
    choicePanel.className = 'choice-panel';
    const q = document.createElement('h3');
    q.className = 'choice-question';
    q.textContent = choice.question;
    choicePanel.appendChild(q);
    const row = document.createElement('div');
    row.className = 'choice-options';
    choice.options.forEach((opt) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--big choice-btn';
      b.textContent = opt.label;
      b.dataset.sceneId = opt.sceneId;
      b.addEventListener('click', () => {
        tapSound();
        applyBranch(opt);
      });
      row.appendChild(b);
    });
    choicePanel.appendChild(row);
    page.appendChild(choicePanel);
    setTimeout(() => speak(choice.question), 300);
  };

  const applyBranch = (opt) => {
    // Swap the scene art + page text with the chosen branch, then let the
    // user re-read it; tapping Next will advance as normal.
    stopReading();
    const oldArt  = page.querySelector('.book-art');
    const oldText = page.querySelector('.page-text');
    const oldChoice = page.querySelector('.choice-panel');
    if (oldChoice) oldChoice.remove();
    if (oldArt) {
      oldArt.innerHTML = '';
      const newScene = buildScene(opt.sceneId);
      oldArt.appendChild(newScene);
      if (interactiveCleanup) interactiveCleanup();
      interactiveCleanup = makeSceneInteractive(newScene);
    }
    if (oldText) {
      oldText.innerHTML = '';
      const { frag, wordSpans } = renderWordRun(opt.text);
      oldText.appendChild(frag);
      setTimeout(() => { stopReading = readAloud(opt.text, wordSpans); }, 250);
      // The Read-to-me button now reads the branch text, not the original.
      readBtn.onclick = () => {
        tapSound();
        stopReading = readAloud(opt.text, wordSpans);
      };
    }
    bumpStat('rounds', 1);
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
        // All questions done — award star, mark book read, then offer
        // either Read Again (the evidence-based fluency move) or Library.
        success();
        rewardStar();
        markBookComplete(book.id);
        bumpStat('rounds', 1);
        speak('You read the book! Great job!');
        renderFinish();
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

  const renderFinish = () => {
    page.innerHTML = '';
    controls.style.display = 'none';

    const cheer = document.createElement('h2');
    cheer.className = 'prompt';
    cheer.textContent = '🎉 You finished the book!';
    page.appendChild(cheer);

    const sub = document.createElement('p');
    sub.className = 'finish-sub';
    sub.textContent = 'Want to read it again? Reading the same book a few times helps you get faster.';
    page.appendChild(sub);

    const row = document.createElement('div');
    row.className = 'finish-actions';

    const again = document.createElement('button');
    again.className = 'btn btn--big';
    again.textContent = '📖 Read Again';
    again.addEventListener('click', () => {
      tapSound();
      controls.style.display = '';
      currentIndex = 0;
      renderPage(0);
    });

    const lib = document.createElement('button');
    lib.className = 'btn';
    lib.textContent = '📚 Back to Library';
    lib.addEventListener('click', () => { tapSound(); ctx.navigate('library'); });

    row.appendChild(again);
    row.appendChild(lib);
    page.appendChild(row);
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
    if (interactiveCleanup) interactiveCleanup();
  };
}
