const picker = document.querySelector('#file-picker');
const slots = [...document.querySelectorAll('.image-slot')];
const resetAll = document.querySelector('.reset-all');
const toast = document.querySelector('.toast');

let activeSlot = null;
let toastTimer;
const objectUrls = new Map();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function refreshResetState() {
  resetAll.disabled = !slots.some((slot) => slot.classList.contains('is-custom'));
}

function chooseFile(slot) {
  activeSlot = slot;
  picker.value = '';
  picker.click();
}

function setSlotImage(slot, file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Vyberte obrázok vo formáte JPG, PNG, WebP alebo AVIF.');
    return;
  }

  const key = slot.dataset.slot;
  const previousUrl = objectUrls.get(key);
  if (previousUrl) URL.revokeObjectURL(previousUrl);

  const url = URL.createObjectURL(file);
  objectUrls.set(key, url);
  slot.querySelector('img').src = url;
  slot.querySelector('.image-slot__reset').disabled = false;
  slot.classList.add('is-custom');
  refreshResetState();
  showToast('Fotografia bola vymenená.');
}

function resetSlot(slot, announce = true) {
  const key = slot.dataset.slot;
  const currentUrl = objectUrls.get(key);
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  objectUrls.delete(key);
  slot.querySelector('img').removeAttribute('src');
  slot.querySelector('.image-slot__reset').disabled = true;
  slot.classList.remove('is-custom');
  refreshResetState();
  if (announce) showToast('Pôvodná fotografia bola obnovená.');
}

slots.forEach((slot) => {
  const pick = slot.querySelector('.image-slot__pick');
  const reset = slot.querySelector('.image-slot__reset');

  pick.addEventListener('click', () => chooseFile(slot));
  reset.addEventListener('click', () => resetSlot(slot));
  pick.addEventListener('keydown', (event) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && slot.classList.contains('is-custom')) {
      event.preventDefault();
      resetSlot(slot);
    }
  });

  ['dragenter', 'dragover'].forEach((name) => slot.addEventListener(name, (event) => {
    event.preventDefault();
    slot.classList.add('is-dragging');
  }));
  slot.addEventListener('dragleave', (event) => {
    if (!slot.contains(event.relatedTarget)) slot.classList.remove('is-dragging');
  });
  slot.addEventListener('drop', (event) => {
    event.preventDefault();
    slot.classList.remove('is-dragging');
    setSlotImage(slot, event.dataTransfer.files[0]);
  });
});

picker.addEventListener('change', () => {
  if (activeSlot && picker.files[0]) setSlotImage(activeSlot, picker.files[0]);
});

resetAll.addEventListener('click', () => {
  slots.forEach((slot) => resetSlot(slot, false));
  showToast('Všetky pôvodné fotografie boli obnovené.');
});

window.addEventListener('beforeunload', () => objectUrls.forEach((url) => URL.revokeObjectURL(url)));
