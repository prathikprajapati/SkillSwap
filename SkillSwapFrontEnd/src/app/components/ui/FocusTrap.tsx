/**
 * FocusTrap Component - Accessibility Enhancement
 * 
 * Features:
 * - Traps focus within a modal/drawer when open
 * - Returns focus to trigger element when closed
 * - Handles Tab and Shift+Tab navigation
 * - Auto-focuses first focusable element
 * - Supports escape key to close
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
  initialFocus?: boolean;
  returnFocus?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

const FOCUSABLE_SELECTORS = [
  'button:not([disabled]):not([aria-hidden="true"])',
  'a[href]:not([aria-hidden="true"])',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"])',
  'select:not([disabled]):not([aria-hidden="true"])',
  'textarea:not([disabled]):not([aria-hidden="true"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
  '[contenteditable]:not([aria-hidden="true"])',
].join(", ");

export function useFocusTrap(
  isActive: boolean,
  options: {
    onEscape?: () => void;
    initialFocus?: boolean;
    returnFocus?: boolean;
  } = {}
) {
  const { onEscape, initialFocus = true, returnFocus = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isTrapped, setIsTrapped] = useState(false);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
    ).filter((el): el is HTMLElement => el instanceof HTMLElement);
  }, []);

  const handleTab = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isActive, getFocusableElements]
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive && onEscape) {
        e.preventDefault();
        onEscape();
      }
    },
    [isActive, onEscape]
  );

  // Store previous active element and set initial focus
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsTrapped(true);

      // Focus first element after a short delay to allow render
      if (initialFocus) {
        setTimeout(() => {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }, 50);
      }
    } else {
      setIsTrapped(false);
    }

    return () => {
      if (returnFocus && !isActive && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, initialFocus, returnFocus, getFocusableElements]);

  // Handle keyboard events
  useEffect(() => {
    if (!isTrapped) return;

    document.addEventListener("keydown", handleTab);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isTrapped, handleTab, handleEscape]);

  return { containerRef, isTrapped };
}

export function FocusTrap({
  children,
  isActive,
  onEscape,
  initialFocus = true,
  returnFocus = true,
  containerRef: externalContainerRef,
}: FocusTrapProps) {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = (containerRef as React.RefObject<HTMLElement>).current;
    if (!container) return [];
    return Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTORS)
    ).filter((el): el is HTMLElement => el instanceof HTMLElement);
  }, [containerRef]);

  const handleTab = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;
      const container = (containerRef as React.RefObject<HTMLElement>).current;
      if (!container) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        if (activeElement === firstElement || !container.contains(activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement || !container.contains(activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    [isActive, containerRef, getFocusableElements]
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive && onEscape) {
        e.preventDefault();
        onEscape();
      }
    },
    [isActive, onEscape]
  );

  // Store previous active element and set initial focus
  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      if (initialFocus) {
        setTimeout(() => {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          }
        }, 50);
      }
    }
  }, [isActive, initialFocus, getFocusableElements]);

  // Return focus on unmount/deactivation
  useEffect(() => {
    return () => {
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [returnFocus]);

  // Handle keyboard events
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("keydown", handleTab);
    if (onEscape) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleTab);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActive, handleTab, handleEscape, onEscape]);

  return <>{children}</>;
}

// Hook for managing focus in modals and overlays
export function useFocusManager() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      setFocusHistory((prev) => [...prev, activeElement]);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    setFocusHistory((prev) => {
      const lastFocus = prev[prev.length - 1];
      if (lastFocus && document.contains(lastFocus)) {
        lastFocus.focus();
      }
      return prev.slice(0, -1);
    });
  }, []);

  return { saveFocus, restoreFocus, focusHistory };
}
