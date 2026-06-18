import type { PlasmoCSConfig } from 'plasmo';
import { messageKeys } from '~constants';

export const config: PlasmoCSConfig = {
    all_frames: false,
    matches: ["http://*/*", "https://*/*"],
    run_at: "document_idle"
}

// border overlay styling
const hostId = 'peek-cli-border'
const activeClass = 'glow-active'
const cssSrc = `
@property --sweep-top {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@property --sweep-bottom {
  syntax: '<angle>';
  initial-value: 3deg;
  inherits: false;
}

:host {
  all: initial;
}

.peek-cli-blur-wrapper {
  position: fixed;
  inset: -100px;
  z-index: 2147483647;
  pointer-events: none;
  filter: blur(15px) saturate(2);
  opacity: 0;
  transform: scale(1.04) translateZ(0);
  will-change: opacity, transform, filter;
  transition: opacity 0.15s ease-in 0.6s, transform 0.15s ease-in 0.6s;
}

.peek-cli-blur-wrapper.${activeClass} {
  opacity: 1;
  transform: scale(1) translateZ(0);
  transition: opacity 0.15s ease-out, transform 0.15s cubic-bezier(0.25, 1.5, 0.5, 1);
}

.peek-cli-sweep-container {
  position: absolute;
  inset: 0;
  will-change: --sweep-top, --sweep-bottom, mask-image, -webkit-mask-image;
  -webkit-mask-image: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    transparent var(--sweep-top),
    white var(--sweep-top),
    white var(--sweep-bottom),
    transparent var(--sweep-bottom),
    transparent calc(360deg - var(--sweep-bottom)),
    white calc(360deg - var(--sweep-bottom)),
    white calc(360deg - var(--sweep-top)),
    transparent calc(360deg - var(--sweep-top)),
    transparent 360deg
  );
  mask-image: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    transparent var(--sweep-top),
    white var(--sweep-top),
    white var(--sweep-bottom),
    transparent var(--sweep-bottom),
    transparent calc(360deg - var(--sweep-bottom)),
    white calc(360deg - var(--sweep-bottom)),
    white calc(360deg - var(--sweep-top)),
    transparent calc(360deg - var(--sweep-top)),
    transparent 360deg
  );
  animation: sweep-out 0.6s ease-in-out forwards;
}

.peek-cli-blur-wrapper.${activeClass} .peek-cli-sweep-container {
  animation: sweep-in 0.6s ease-in-out forwards;
}

.peek-cli-hard-ring {
  position: absolute;
  inset: 80px;
  border: 16px solid transparent;
  filter: brightness(1.5) saturate(1.4);
  will-change: filter;
  -webkit-mask:
    linear-gradient(white, white) padding-box,
    linear-gradient(white, white);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(white, white) padding-box,
    linear-gradient(white, white);
  mask-composite: exclude;
}

.peek-cli-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200vmax;
  height: 200vmax;
  transform: translate(-50%, -50%) rotate(0deg);
  will-change: transform;
  background: conic-gradient(
    from 0deg,
    #ff00a0 0deg,
    #ff00a0 110deg,
    #ff5e00 180deg,
    #ff5e00 290deg,
    #ff00a0 360deg
  );
  animation: spin 8s linear infinite;
  animation-play-state: paused;
}

.peek-cli-blur-wrapper.${activeClass} .peek-cli-spinner {
  animation-play-state: running;
}

.peek-cli-blur-wrapper.${activeClass} .peek-cli-hard-ring {
  animation: periodic-pulse 3s linear 0.5s infinite;
}

@keyframes sweep-in {
  0% {
    --sweep-top: 0deg;
    --sweep-bottom: 3deg;
  }

  100% {
    --sweep-top: 0deg;
    --sweep-bottom: 180deg;
  }
}

@keyframes sweep-out {
  0% {
    --sweep-top: 0deg;
    --sweep-bottom: 180deg;
  }

  100% {
    --sweep-top: 180deg;
    --sweep-bottom: 180deg;
  }
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes periodic-pulse {
  0%,
  55% {
    filter: brightness(1.5) saturate(1.4);
    animation-timing-function: ease-in-out;
  }

  77.5% {
    filter: brightness(2) saturate(1.8);
    animation-timing-function: ease-in-out;
  }

  100% {
    filter: brightness(1.5) saturate(1.4);
  }
}
`

/**
 * one level shallower than actual
 * this is the HTML inside the wrapper
 */
const htmlSrc = `
<div class="peek-cli-sweep-container">
  <div class="peek-cli-hard-ring">
    <div class="peek-cli-spinner"></div>
  </div>
</div>
`

/**
 * 
 */
const createOverlay = () => {
    const existing = document.getElementById(hostId)
    if (existing?.shadowRoot) return existing.shadowRoot.querySelector('.peek-cli-blur-wrapper')

    const host = document.createElement("div")
    host.id = hostId;
    const shadow = host.attachShadow({ mode: "open" })

    // raw source injection 
    // ===
    const style = document.createElement("style")
    style.textContent = cssSrc
    
    const wrapper = document.createElement("div")
    wrapper.className = "peek-cli-blur-wrapper"
    wrapper.setAttribute("aria-hidden", "true")
    wrapper.innerHTML = htmlSrc
    // ===
    
    shadow.append(style)
    shadow.append(wrapper)
    document.documentElement.append(host)

    return wrapper
}

let alreadyRegisteredProps = false
const registerCSSProps = () => {
    if (alreadyRegisteredProps || !CSS.registerProperty) return;

    try {
        CSS.registerProperty({
            name: "--sweep-top",
            syntax: "<angle>",
            inherits: false,
            initialValue: "0deg"
        })
        CSS.registerProperty({
            name: "--sweep-bottom",
            syntax: "<angle>",
            inherits: false,
            initialValue: "3deg"
        })
    } catch {}

    alreadyRegisteredProps = true
}

const showOverlay = () => {
  registerCSSProps()
  const wrapper = createOverlay();
  wrapper.getBoundingClientRect();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      wrapper.classList.add(activeClass)
    })
  })
}

const hideOverlay = () => {
  const wrapper = createOverlay()

  wrapper.addEventListener("animationend", () => {
    document.getElementById(hostId).remove()
  })

  wrapper.classList.remove('glow-active')
}

export interface PeekCLIMessage {
  type: string
}

chrome.runtime.onMessage.addListener((message: PeekCLIMessage) => {
  if(message.type === messageKeys.showGlow) showOverlay();
  else if(message.type === messageKeys.hideGlow) hideOverlay()
})