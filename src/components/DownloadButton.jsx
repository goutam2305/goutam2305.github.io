import { useEffect, useRef, useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { getDownloadUrl } from '../projects';
import { termsVersion } from '../terms';

const consentKey = 'goutam-lab-terms';
export function DownloadButton({ project }) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const trigger = useRef(null);
  const dialog = useRef(null);
  const url = getDownloadUrl(project);
  const close = () => { dialog.current?.close?.(); setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    if (element.showModal) element.showModal();
    else element.setAttribute('open', '');
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close?.(); document.body.style.overflow = overflow; };
  }, [open]);
  const start = event => {
    let agreed = false;
    try { agreed = localStorage.getItem(consentKey) === termsVersion; } catch { /* Consent still works when storage is unavailable. */ }
    if (agreed) return;
    event.preventDefault(); setAccepted(false); setOpen(true);
  };
  const download = () => {
    if (!accepted) return;
    try { localStorage.setItem(consentKey, termsVersion); } catch { /* Ask again next time if storage is blocked. */ }
    const link = document.createElement('a');
    link.href = url; link.download = project.release.fileName;
    document.body.append(link); link.click(); link.remove();
    close();
  };
  return <div className="download-control">
    <a ref={trigger} className="primary-button" href={url} download={project.release.fileName} onClick={start}><DownloadSimple size={20} aria-hidden="true" /> Download .mzp</a>
    <p className="download-meta">{project.release.version} · {Math.ceil(project.release.bytes / 1024)} KB · 3ds Max 2026</p>
    {open && <dialog ref={dialog} className="download-dialog" aria-labelledby="download-heading" aria-describedby="download-summary" onCancel={event => { event.preventDefault(); close(); }}>
      <button className="download-close" type="button" aria-label="Close download terms" onClick={close}>×</button>
      <p className="eyebrow">{project.name}</p>
      <h2 id="download-heading">Before you download</h2>
      <p id="download-summary">Free for personal and commercial use.</p>
      <ul className="download-terms-summary"><li>Modifying the software requires prior consent from GOUTAM Lab.</li><li>Your settings, projects and generated outputs are yours to edit and use.</li><li>This is a beta. Keep backups and test on a copy.</li></ul>
      <p><a href="#/terms">Read the full software terms</a> <span className="download-terms-version">({termsVersion})</span></p>
      <label className="download-consent"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} /> <span>I have read and agree to the software terms.</span></label>
      <div className="download-actions"><button className="primary-button" type="button" disabled={!accepted} onClick={download}>Agree &amp; download</button><button className="text-button" type="button" onClick={close}>Cancel</button></div>
    </dialog>}
  </div>;
}
