// ============================================================
// Reusable SearchableSelect (Combobox)
// Generic UI primitive. Not CMS-specific or form-specific.
// ============================================================

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SearchableSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select...",
  className = "",
  hasError = false,
  disabled = false,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, handleClose]);

  function handleOpen() {
    setIsOpen(true);
    setHighlightedIndex(0);
  }

  function handleSelect(option: string) {
    onChange(option);
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClose();
        break;
      case "Tab":
        handleClose();
        break;
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onBlur={(e) => {
        // Avoid closing when focus moves within dropdown
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleClose();
          onBlur?.();
        }
      }}
    >
      <input
        id={id}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={id ? `${id}-listbox` : undefined}
        value={isOpen ? query : value}
        placeholder={value || placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightedIndex(0);
          setIsOpen(true);
        }}
        onFocus={handleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
          hasError ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      />
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>

      {isOpen && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  index === highlightedIndex
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700"
                } ${option === value ? "font-semibold" : ""}`}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No matching options</li>
          )}
        </ul>
      )}
    </div>
  );
}