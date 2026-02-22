/**
 * Morning Flow - 朝ルーティンアプリ
 * 頭を使わずに朝のタスクをこなすためのシンプルなガイドアプリ
 */

// =========================================
// Default Routine Steps
// =========================================

const DEFAULT_STEPS = [
  {
    id: 1,
    title: "起床",
    emoji: "🌅",
    duration: 300,
    tip: "朝日を浴びて体内時計をスイッチON！"
  },
  {
    id: 2,
    title: "コップ一杯の水を飲む",
    emoji: "💧",
    duration: 60,
    tip: "白湯だとさらに体に優しいです"
  },
  {
    id: 3,
    title: "歯を磨く",
    emoji: "🪥",
    duration: 180,
    tip: "3分間しっかり磨いて目を覚ましましょう"
  },
  {
    id: 4,
    title: "顔を洗う",
    emoji: "🧼",
    duration: 180,
    tip: "冷たい水で毛穴を引き締め！"
  },
  {
    id: 5,
    title: "朝ごはんを食べる",
    emoji: "🍳",
    duration: 600,
    tip: "エネルギーチャージして脳を活性化"
  },
  {
    id: 6,
    title: "着替える",
    emoji: "👔",
    duration: 300,
    tip: "今日も気合を入れていきましょう"
  },
  {
    id: 7,
    title: "持ち物チェック",
    emoji: "🎒",
    duration: 180,
    tip: "財布・鍵・スマホ・定期は持ちましたか？"
  },
  {
    id: 8,
    title: "準備OK",
    emoji: "👌",
    duration: 0,
    tip: "いってらっしゃい！"
  }
];

const EMOJI_MAP = {
  "起床": "🌅", "起きる": "🌅",
  "水": "💧", "飲む": "💧",
  "朝食": "🍳", "ご飯": "🍳", "食べる": "🍳",
  "歯": "🪥", "磨く": "🪥",
  "顔": "🧼", "洗う": "🧼",
  "メイク": "💄", "化粧": "💄",
  "着替え": "👔", "支度": "👔",
  "仕事": "💻", "作業": "💻", "メール": "📧",
  "勉強": "📚", "読書": "📖",
  "運動": "🏃", "ジム": "💪", "ヨガ": "🧘", "筋トレ": "💪", "散歩": "🚶",
  "シャワー": "🚿", "風呂": "🛀",
  "トイレ": "🚽",
  "薬": "💊", "サプリ": "💊",
  "準備": "🎒", "移動": "🚃", "出発": "🚪",
  "ゴミ": "🗑️", "掃除": "🧹", "洗濯": "🧺",
  "ニュース": "📰", "天気": "☀️",
  "瞑想": "🧘", "ストレッチ": "🙆",
  "コーヒー": "☕", "お茶": "🍵"
};

const STORAGE_KEY = 'morningflow_steps';

// =========================================
// Storage Helper
// =========================================

function loadSteps() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore parse errors
  }
  return JSON.parse(JSON.stringify(DEFAULT_STEPS));
}

function saveSteps(steps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
}

// Global mutable steps array
let routineSteps = loadSteps();

// =========================================
// Screen Navigation Helper
// =========================================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

// =========================================
// Morning Routine App
// =========================================

class MorningFlowApp {
  constructor() {
    this.routine = null;
    this.editor = null;

    // Home screen elements
    this.homeStartBtn = document.getElementById('homeStartBtn');
    this.homeEditBtn = document.getElementById('homeEditBtn');
    this.homePreviewSteps = document.getElementById('homePreviewSteps');
    this.homePreviewTotal = document.getElementById('homePreviewTotal');
    this.routineHomeBtn = document.getElementById('routineHomeBtn');

    this.init();
  }

  init() {
    this.routine = new MorningRoutine(this);
    this.editor = new RoutineEditor(this);

    this.homeStartBtn.addEventListener('click', () => this.startRoutine());
    this.homeEditBtn.addEventListener('click', () => this.openEditor());
    this.routineHomeBtn.addEventListener('click', () => this.goHome());

    this.renderHomePreview();
  }

  renderHomePreview() {
    const steps = loadSteps();
    this.homePreviewSteps.innerHTML = '';

    steps.forEach(step => {
      const chip = document.createElement('div');
      chip.className = 'home-preview-chip';
      chip.innerHTML = `<span class="home-preview-chip-emoji">${step.emoji}</span><span>${step.title}</span>`;
      this.homePreviewSteps.appendChild(chip);
    });

    const totalMin = Math.ceil(steps.reduce((sum, s) => sum + s.duration, 0) / 60);
    this.homePreviewTotal.textContent = `合計 約${totalMin}分`;
  }

  startRoutine() {
    routineSteps = loadSteps();
    this.routine.reset();
    showScreen('routineScreen');
  }

  openEditor() {
    this.editor.open();
  }

  goHome() {
    if (this.routine.timerInterval) clearInterval(this.routine.timerInterval);
    this.renderHomePreview();
    showScreen('homeScreen');
  }
}

// =========================================
// Morning Routine Class
// =========================================

class MorningRoutine {
  constructor(app) {
    this.app = app;
    this.currentStep = 0;
    this.startTime = null;
    this.stepStartTime = null;
    this.timerInterval = null;
    this.isCompleted = false;

    // DOM Elements
    this.elements = {
      stepDisplay: document.getElementById('stepDisplay'),
      completionScreen: document.getElementById('completionScreen'),
      stepEmoji: document.getElementById('stepEmoji'),
      stepTitle: document.getElementById('stepTitle'),
      stepTip: document.getElementById('stepTip'),
      timerText: document.getElementById('timerText'),
      timerProgress: document.getElementById('timerProgress'),
      progressBar: document.getElementById('progressBar'),
      currentStepNum: document.getElementById('currentStepNum'),
      totalSteps: document.getElementById('totalSteps'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      navButtons: document.querySelector('.nav-buttons'),
      restartBtn: document.getElementById('restartBtn'),
      totalTime: document.getElementById('totalTime')
    };

    this.bindEvents();
    this.addTimerGradient();
  }

  bindEvents() {
    this.elements.nextBtn.addEventListener('click', () => this.nextStep());
    this.elements.prevBtn.addEventListener('click', () => this.prevStep());
    this.elements.restartBtn.addEventListener('click', () => this.app.goHome());

    document.addEventListener('keydown', (e) => {
      // Only respond when routine screen is visible
      const routineScreen = document.getElementById('routineScreen');
      if (routineScreen.classList.contains('hidden')) return;
      if (this.isCompleted) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevStep();
      }
    });

    this.setupSwipeGestures();
  }

  reset() {
    this.currentStep = 0;
    this.isCompleted = false;
    this.startTime = Date.now();
    this.elements.totalSteps.textContent = routineSteps.length;

    this.elements.completionScreen.classList.remove('active');
    this.elements.stepDisplay.classList.remove('hidden');
    this.elements.navButtons.classList.remove('hidden');
    this.elements.timerText.style.color = '';

    this.renderCurrentStep();
  }

  addTimerGradient() {
    const svg = document.querySelector('.timer-svg');
    if (!svg) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e94560"/>
        <stop offset="100%" style="stop-color:#533483"/>
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
  }

  setupSwipeGestures() {
    let touchStartX = 0;
    this.elements.stepDisplay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.elements.stepDisplay.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.nextStep() : this.prevStep();
      }
    }, { passive: true });
  }

  renderCurrentStep() {
    if (routineSteps.length === 0) return;
    const step = routineSteps[this.currentStep];

    this.elements.stepEmoji.textContent = step.emoji;
    this.elements.stepTitle.textContent = step.title;
    this.elements.stepTip.textContent = step.tip;
    this.elements.currentStepNum.textContent = this.currentStep + 1;

    const progress = (this.currentStep / routineSteps.length) * 100;
    this.elements.progressBar.style.width = `${progress}%`;

    this.elements.prevBtn.disabled = this.currentStep === 0;

    const nextLabel = this.elements.nextBtn.querySelector('.nav-label');
    nextLabel.textContent = this.currentStep === routineSteps.length - 1 ? '完了' : '次へ';

    this.startTimer(step.duration);
  }

  startTimer(duration) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.stepStartTime = Date.now();
    let remainingTime = duration;
    const circumference = 2 * Math.PI * 45;

    this.updateTimerDisplay(remainingTime, duration, circumference);

    this.timerInterval = setInterval(() => {
      remainingTime--;
      if (remainingTime <= 0) {
        clearInterval(this.timerInterval);
        remainingTime = 0;
        this.elements.timerText.style.color = '#4ade80';
      }
      this.updateTimerDisplay(remainingTime, duration, circumference);
    }, 1000);
  }

  updateTimerDisplay(remaining, total, circumference) {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    this.elements.timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const progress = total === 0 ? 1 : remaining / total;
    this.elements.timerProgress.style.strokeDashoffset = circumference * (1 - progress);
  }

  nextStep() {
    if (this.currentStep >= routineSteps.length - 1) {
      this.complete();
      return;
    }
    this.elements.stepDisplay.classList.add('slide-out-left');
    setTimeout(() => {
      this.currentStep++;
      this.elements.stepDisplay.classList.remove('slide-out-left');
      this.elements.stepDisplay.classList.add('slide-in');
      this.renderCurrentStep();
      this.elements.timerText.style.color = '';
      setTimeout(() => this.elements.stepDisplay.classList.remove('slide-in'), 50);
    }, 200);
  }

  prevStep() {
    if (this.currentStep <= 0) return;
    this.elements.stepDisplay.classList.add('slide-out-right');
    setTimeout(() => {
      this.currentStep--;
      this.elements.stepDisplay.classList.remove('slide-out-right');
      this.elements.stepDisplay.classList.add('slide-in');
      this.renderCurrentStep();
      this.elements.timerText.style.color = '';
      setTimeout(() => this.elements.stepDisplay.classList.remove('slide-in'), 50);
    }, 200);
  }

  complete() {
    this.isCompleted = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.elements.totalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.elements.progressBar.style.width = '100%';
    this.elements.stepDisplay.classList.add('hidden');
    this.elements.navButtons.classList.add('hidden');
    this.elements.completionScreen.classList.add('active');
  }
}

// =========================================
// Routine Editor Class
// =========================================

class RoutineEditor {
  constructor(app) {
    this.app = app;
    this.editingIndex = -1;
    this.dragSrcIndex = null;

    this.elements = {
      editorScreen: document.getElementById('editorScreen'),
      editorList: document.getElementById('editorList'),
      editorBackBtn: document.getElementById('editorBackBtn'),
      editorAddBtn: document.getElementById('editorAddBtn'),
      editorResetBtn: document.getElementById('editorResetBtn'),
      modal: document.getElementById('editModal'),
      modalTitle: document.getElementById('modalTitle'),
      modalEmoji: document.getElementById('modalEmoji'),
      modalStepTitle: document.getElementById('modalStepTitle'),
      modalTip: document.getElementById('modalTip'),
      modalDuration: document.getElementById('modalDuration'),
      modalCancel: document.getElementById('modalCancel'),
      modalSave: document.getElementById('modalSave')
    };

    this.bindEvents();
  }

  bindEvents() {
    this.elements.editorBackBtn.addEventListener('click', () => this.close());
    this.elements.editorAddBtn.addEventListener('click', () => this.openModal(-1));
    this.elements.editorResetBtn.addEventListener('click', () => this.resetToDefault());
    this.elements.modalCancel.addEventListener('click', () => this.closeModal());
    this.elements.modalSave.addEventListener('click', () => this.saveModal());

    this.elements.modal.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) this.closeModal();
    });

    // Auto-suggest emoji based on title input
    this.elements.modalStepTitle.addEventListener('input', (e) => {
      const title = e.target.value;
      const currentEmoji = this.elements.modalEmoji.value;

      // Only suggest if emoji field is empty or default star
      if (currentEmoji === '' || currentEmoji === '⭐') {
        for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
          if (title.includes(keyword)) {
            this.elements.modalEmoji.value = emoji;
            // Add a subtle animation to highlight the change
            this.elements.modalEmoji.style.transition = 'transform 0.2s';
            this.elements.modalEmoji.style.transform = 'scale(1.2)';
            setTimeout(() => this.elements.modalEmoji.style.transform = 'scale(1)', 200);
            return; // Stop after first match
          }
        }
      }
    });

    // Select text on focus for all inputs
    [
      this.elements.modalEmoji,
      this.elements.modalStepTitle,
      this.elements.modalTip,
      this.elements.modalDuration
    ].forEach(input => {
      input.addEventListener('focus', (e) => e.target.select());
    });
  }

  open() {
    showScreen('editorScreen');
    this.renderList();
  }

  close() {
    this.app.renderHomePreview();
    showScreen('homeScreen');
  }

  renderList() {
    const steps = loadSteps();
    this.elements.editorList.innerHTML = '';

    steps.forEach((step, index) => {
      const item = document.createElement('div');
      item.className = 'editor-item';
      item.draggable = true;
      item.dataset.index = index;

      const minutes = step.duration / 60;
      const durationText = minutes >= 1 ? `${minutes}分` : `${step.duration}秒`;

      item.innerHTML = `
        <div class="editor-item-drag" title="ドラッグして並べ替え">⠿</div>
        <div class="editor-item-emoji">${step.emoji}</div>
        <div class="editor-item-info">
          <div class="editor-item-title">${step.title}</div>
          <div class="editor-item-duration">${durationText}</div>
        </div>
        <div class="editor-item-actions">
          <button class="editor-item-edit" data-index="${index}" title="編集">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="editor-item-delete" data-index="${index}" title="削除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      // Drag events
      item.addEventListener('dragstart', (e) => this.onDragStart(e, index));
      item.addEventListener('dragover', (e) => this.onDragOver(e));
      item.addEventListener('dragenter', (e) => this.onDragEnter(e, item));
      item.addEventListener('dragleave', (e) => this.onDragLeave(e, item));
      item.addEventListener('drop', (e) => this.onDrop(e, index));
      item.addEventListener('dragend', () => this.onDragEnd());

      // Touch drag support
      this.addTouchDragSupport(item, index);

      // Edit/Delete buttons
      item.querySelector('.editor-item-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal(index);
      });
      item.querySelector('.editor-item-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteStep(index);
      });

      this.elements.editorList.appendChild(item);
    });
  }

  // --- Drag & Drop ---

  onDragStart(e, index) {
    this.dragSrcIndex = index;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isBottomHalf = offsetY > rect.height / 2;

    item.classList.remove('drag-over-top', 'drag-over-bottom');
    if (isBottomHalf) {
      item.classList.add('drag-over-bottom');
    } else {
      item.classList.add('drag-over-top');
    }
  }

  onDragEnter(e, item) {
    e.preventDefault();
  }

  onDragLeave(e, item) {
    item.classList.remove('drag-over-top', 'drag-over-bottom');
  }

  onDrop(e, targetIndex) {
    e.preventDefault();
    const item = e.currentTarget;
    const scale = item.classList.contains('drag-over-bottom') ? 'bottom' : 'top';
    item.classList.remove('drag-over-top', 'drag-over-bottom');

    if (this.dragSrcIndex === null || this.dragSrcIndex === targetIndex) return;

    // Calculate insertion point
    // If dropped on top half: insert at targetIndex
    // If dropped on bottom half: insert at targetIndex + 1
    // Adjust for removal of src item
    let insertionIndex = targetIndex;
    if (scale === 'bottom') insertionIndex++;

    if (this.dragSrcIndex < insertionIndex) {
      insertionIndex--;
    }

    // Optimization: if verification shows no change, return
    if (this.dragSrcIndex === insertionIndex) return;

    const steps = loadSteps();
    const [moved] = steps.splice(this.dragSrcIndex, 1);
    steps.splice(insertionIndex, 0, moved);

    steps.forEach((s, i) => s.id = i + 1);
    saveSteps(steps);
    this.renderList();
  }

  onDragEnd() {
    this.dragSrcIndex = null;
    document.querySelectorAll('.editor-item').forEach(el => {
      el.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom');
    });
  }

  // --- Touch Drag Support ---

  addTouchDragSupport(item, index) {
    const dragHandle = item.querySelector('.editor-item-drag');
    let touchStartY = 0;
    let moved = false;

    dragHandle.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      this.dragSrcIndex = index;
      moved = false;

      setTimeout(() => {
        if (this.dragSrcIndex !== null) {
          item.classList.add('dragging');
        }
      }, 100);
    }, { passive: true });

    dragHandle.addEventListener('touchmove', (e) => {
      e.preventDefault();
      moved = true;
      const touch = e.touches[0];
      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);

      document.querySelectorAll('.editor-item').forEach(el => el.classList.remove('drag-over-top', 'drag-over-bottom'));

      const targetItem = targetEl?.closest('.editor-item');
      if (targetItem && targetItem !== item) {
        // Calculate position relative to target item
        const rect = targetItem.getBoundingClientRect();
        const offsetY = touch.clientY - rect.top;
        const isBottomHalf = offsetY > rect.height / 2;

        targetItem.classList.remove('drag-over-top', 'drag-over-bottom');
        if (isBottomHalf) {
          targetItem.classList.add('drag-over-bottom');
        } else {
          targetItem.classList.add('drag-over-top');
        }
      }
    }, { passive: false });

    dragHandle.addEventListener('touchend', (e) => {
      if (!moved) {
        item.classList.remove('dragging');
        this.dragSrcIndex = null;
        return;
      }

      const touch = e.changedTouches[0];
      const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetItem = targetEl?.closest('.editor-item');

      if (targetItem && targetItem !== item) {
        const rect = targetItem.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const offsetY = touch.clientY - rect.top;
        const isBottomHalf = offsetY > rect.height / 2;

        const targetIdx = parseInt(targetItem.dataset.index, 10);

        // Mock event for onDrop logic interaction or handle directly
        // Since onDrop relies on classList for logic (which we just set in touchmove but might have cleared?),
        // let's replicate logic or force class.
        // Actually, onDrop uses e.currentTarget which is targetItem.
        // We need to ensure class is present or pass info.
        // Let's modify onDrop to accept optional placement arg or read class from targetItem.
        // We set class in touchmove. It should be there.

        // Wait, onDrop calls e.preventDefault(). We need to construct a fake event or refactor onDrop.
        // Refactoring onDrop to separate logic is cleaner.
        // For now, let's just use the logic directly here.

        let insertionIndex = targetIdx;
        if (isBottomHalf) insertionIndex++;

        if (this.dragSrcIndex < insertionIndex) insertionIndex--;

        if (this.dragSrcIndex !== insertionIndex) {
          const steps = loadSteps();
          const [moved] = steps.splice(this.dragSrcIndex, 1);
          steps.splice(insertionIndex, 0, moved);

          steps.forEach((s, i) => s.id = i + 1);
          saveSteps(steps);
          this.renderList();
        }
      }

      item.classList.remove('dragging');
      this.dragSrcIndex = null;
      document.querySelectorAll('.editor-item').forEach(el => el.classList.remove('drag-over-top', 'drag-over-bottom'));
    }, { passive: true });
  }

  // --- Modal ---

  openModal(index) {
    this.editingIndex = index;
    const modal = this.elements;

    if (index === -1) {
      modal.modalTitle.textContent = 'ステップを追加';
      modal.modalEmoji.value = '⭐';
      modal.modalStepTitle.value = '';
      modal.modalTip.value = '';
      modal.modalDuration.value = '1';
    } else {
      const steps = loadSteps();
      const step = steps[index];
      modal.modalTitle.textContent = 'ステップを編集';
      modal.modalEmoji.value = step.emoji;
      modal.modalStepTitle.value = step.title;
      modal.modalTip.value = step.tip;
      modal.modalDuration.value = (step.duration / 60).toString();
    }

    modal.modal.classList.remove('hidden');
    setTimeout(() => modal.modalStepTitle.focus(), 100);
  }

  closeModal() {
    this.elements.modal.classList.add('hidden');
    this.editingIndex = -1;
  }

  saveModal() {
    const modal = this.elements;
    const title = modal.modalStepTitle.value.trim();
    if (!title) {
      modal.modalStepTitle.focus();
      modal.modalStepTitle.style.outline = '2px solid var(--accent)';
      setTimeout(() => modal.modalStepTitle.style.outline = '', 1500);
      return;
    }

    const emoji = modal.modalEmoji.value.trim() || '⭐';
    const tip = modal.modalTip.value.trim() || '';
    const durationMin = parseFloat(modal.modalDuration.value) || 0;
    const duration = Math.max(0, Math.round(durationMin * 60));

    const steps = loadSteps();

    if (this.editingIndex === -1) {
      steps.push({ id: steps.length + 1, title, emoji, duration, tip });
    } else {
      steps[this.editingIndex] = { ...steps[this.editingIndex], title, emoji, duration, tip };
    }

    steps.forEach((s, i) => s.id = i + 1);
    saveSteps(steps);
    this.closeModal();
    this.renderList();
  }

  deleteStep(index) {
    const steps = loadSteps();
    if (steps.length <= 1) return;

    steps.splice(index, 1);
    steps.forEach((s, i) => s.id = i + 1);
    saveSteps(steps);
    this.renderList();
  }

  resetToDefault() {
    saveSteps(JSON.parse(JSON.stringify(DEFAULT_STEPS)));
    this.renderList();
  }
}

// =========================================
// Initialize App
// =========================================

document.addEventListener('DOMContentLoaded', () => {
  new MorningFlowApp();
});
