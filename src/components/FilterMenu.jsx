import { useEffect, useRef, useState } from 'react';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import { filters } from '../projects';

export function FilterMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const menu = useRef(null);
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
    <div className="filter-control" ref={root}>
      <button className={`icon-button filter-trigger${value !== 'all' ? ' is-filtered' : ''}`} ref={trigger}
        aria-label={`Filter tools: ${current.label}`} title={`Filter tools: ${current.label}`}
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? 'tool-filters' : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
        <SlidersHorizontal size={23} weight="regular" />
        {value !== 'all' && <span className="filter-dot" aria-hidden="true" />}
      </button>
      {open && (
        <div className="filter-menu" id="tool-filters" role="menu" aria-label="Filter tools" ref={menu} onKeyDown={navigate}>
          <p className="filter-menu-title">Show tools</p>
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
