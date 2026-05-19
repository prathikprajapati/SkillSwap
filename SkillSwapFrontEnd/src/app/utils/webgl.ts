/**
 * WebGL utility functions for feature detection and fallback handling
 */

/**
 * Checks if WebGL is supported in the current browser/environment
 * @returns true if WebGL is supported, false otherwise
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return gl instanceof WebGLRenderingContext;
  } catch (e) {
    return false;
  }
}

/**
 * Attempts to get a WebGL context from a canvas element
 * @param canvas - The canvas element to get context from
 * @returns WebGL context or null if not available
 */
export function getWebGLContext(
  canvas: HTMLCanvasElement,
): WebGLRenderingContext | null {
  try {
    return (
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch (e) {
    return null;
  }
}

/**
 * Creates a fallback UI element when WebGL is not supported
 * @param container - The container element to append fallback to
 * @param className - Additional CSS classes for styling
 * @returns The fallback element
 */
export function createWebGLFallback(
  container: HTMLElement,
  className = "",
): HTMLElement {
  const fallback = document.createElement("div");
  fallback.className = `webgl-fallback flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 ${className}`;
  fallback.innerHTML = `
    <div class="text-center p-4">
      <div class="text-4xl mb-2">✨</div>
      <p class="text-sm">WebGL not supported</p>
      <p class="text-xs opacity-75">Light rays effect unavailable</p>
    </div>
  `;
  fallback.setAttribute("aria-label", "WebGL light rays effect not supported");
  fallback.setAttribute("role", "img");
  return fallback;
}

/**
 * Safely disposes of WebGL resources
 * @param gl - The WebGL context to dispose
 */
export function disposeWebGL(gl: WebGLRenderingContext): void {
  try {
    const loseContextExt = gl.getExtension("WEBGL_lose_context");
    if (loseContextExt) {
      loseContextExt.loseContext();
    }
  } catch (error) {
    console.warn("Error disposing WebGL context:", error);
  }
}
