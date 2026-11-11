export function scrollToChapter(id) {
  const chapter = document.getElementById(`doc-${id}`);
  if (!chapter) return false;
  chapter.scrollIntoView({ block: 'start', behavior: 'instant' });
  chapter.focus({ preventScroll: true });
  return true;
}
