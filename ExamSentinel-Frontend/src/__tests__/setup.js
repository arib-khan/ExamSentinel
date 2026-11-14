import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => { cleanup(); });

// jsdom gaps used by Radix / shadcn
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }));
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function () {};
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false);
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {});
window.scrollTo = () => {};
// <video>/<audio> in jsdom
HTMLMediaElement.prototype.play = HTMLMediaElement.prototype.play || (() => Promise.resolve());
