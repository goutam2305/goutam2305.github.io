import { useEffect, useRef, useState } from 'react';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { TagSimple } from '@phosphor-icons/react/dist/csr/TagSimple';
import { filters } from '../projects';

export function FilterMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const menu = useRef(null);
  const pull = useRef(null);
  const ignoreClick = useRef(false);
  const current = filters.find((item) => item.id === value) ?? filters[0];
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector('[aria-checked="true"]')?.focus();
    const onOutside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('focusin', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('focusin', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);
  const navigate = (event) => {
    const items = [...menu.current.querySelectorAll('[role="menuitemradio"]')];
    const index = items.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      items[next].focus();
    }
  };
  return (
    <div className="filter-control project-selector" ref={root}>
      <button className={`project-tag filter-trigger${value !== 'all' ? ' is-filtered' : ''}`} ref={trigger}
        aria-label={`Filter tools: ${current.label}`} title={`Filter tools: ${current.label}`}
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? 'tool-filters' : undefined}
        onClick={event => { if (event.detail && pull.current) { event.preventDefault(); return; } if (event.detail && ignoreClick.current) { ignoreClick.current = false; return; } setOpen(!open); }}
        onPointerDown={event => {
          if (event.button !== 0 || pull.current) return;
          ignoreClick.current = false;
          pull.current = { id: event.pointerId, y: event.clientY, distance: 0 };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={event => {
          if (pull.current?.id !== event.pointerId) return;
          pull.current.distance = Math.max(0, Math.min(14, event.clientY - pull.current.y));
          event.currentTarget.style.setProperty('--tag-pull', `${pull.current.distance}px`);
        }}
        onPointerUp={event => {
          if (pull.current?.id !== event.pointerId) return;
          if (pull.current.distance >= 8) { setOpen(true); ignoreClick.current = true; }
          pull.current = null;
          event.currentTarget.style.removeProperty('--tag-pull');
        }}
        onPointerCancel={event => { if (pull.current?.id !== event.pointerId) return; pull.current = null; event.currentTarget.style.removeProperty('--tag-pull'); }}
        onLostPointerCapture={event => { if (pull.current?.id !== event.pointerId) return; pull.current = null; event.currentTarget.style.removeProperty('--tag-pull'); }}
        onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
        <TagSimple size={17} aria-hidden="true" /><span>{value === 'all' ? 'All projects' : current.label}</span><CaretDown size={12} weight="bold" aria-hidden="true" />
      </button>
      {open && (
        <div className="filter-menu" id="tool-filters" role="menu" aria-label="Filter tools" ref={menu} onKeyDown={navigate}>
          <p className="filter-menu-title">Project selector</p>
          {filters.map((item) => (
            <button key={item.id} role="menuitemradio" aria-checked={value === item.id} tabIndex={value === item.id ? 0 : -1}
              onClick={() => { onChange(item.id); close(true); }}>
              <span>{item.label}</span>{value === item.id && <Check size={18} weight="bold" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
