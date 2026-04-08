"use client";

import { useEffect } from "react";

const HEADER_SELECTOR = "[data-site-header]";

export function HeaderOffsetObserver() {
  useEffect(() => {
    const header = document.querySelector(HEADER_SELECTOR);
    if (!(header instanceof HTMLElement)) {
      return;
    }

    const root = document.documentElement;
    const updateHeaderHeight = () => {
      root.style.setProperty("--site-header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    resizeObserver.observe(header);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  return null;
}