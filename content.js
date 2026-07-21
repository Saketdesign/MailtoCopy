/**
 * Mailto:Copy Extension - Content Script
 * Intercepts mailto: links and copies the email to clipboard
 */

// Track the last handled interaction to prevent duplicate actions (e.g., from mousedown followed by click)
let lastInteractionTime = 0;
const INTERACTION_COOLDOWN = 500;

// Track toast timers for smooth animation transitions
let toastHideTimeout;
let toastRemovalTimeout;
let successAudioContext;
const PULSE_DURATION_MS = 1500;
const SHADER_SETTINGS = {
  aspectRatio: 'auto',
  speed: 1,
  scale: 1.01,
  roundness: 0,
  softness: 1,
  rotation: 180,
  thickness: 0.121,
  intensity: 0.25,
  bloom: 0.36,
  spots: 5,
  spotSize: 0.5,
  pulse: 0.25,
  smoke: 0.37,
  smokeSize: 0.23,
  colors: ['#0DC1FD', '#D915EF', '#FF3F2ECC'],
};

/**
 * Main handler for intercepted events
 */
async function handleMailtoIntercept(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  // Try to find the closest anchor tag up the DOM tree
  const anchor = event.target.closest('a');
  
  if (anchor && anchor.href && anchor.href.toLowerCase().startsWith('mailto:')) {
    // ALWAYS stop the event immediately to prevent the browser or other scripts from reacting
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // Prevent duplicate processing if multiple events (mousedown, click, etc.) fire for one interaction
    const now = Date.now();
    if (now - lastInteractionTime < INTERACTION_COOLDOWN) {
      return;
    }
    lastInteractionTime = now;
    
    // Extract the email address
    // The href could be something like "mailto:user@example.com?subject=Hello"
    let email = anchor.href.replace(/^mailto:/i, ''); // Remove the "mailto:" prefix (case insensitive)
    email = email.split('?')[0]; // Remove any query parameters like "?subject=..."
    email = decodeURIComponent(email); // Decode any escaped characters
    
    try {
      // Copy the extracted email to the clipboard
      await navigator.clipboard.writeText(email);
      showConfirmationPulse();
      playSuccessSound();
      showToast(`email copied`);
      console.log(`Mailto:Copy: Success copying "${email}" to clipboard.`);
    } catch (err) {
      console.error('Mailto:Copy: Failed to copy email: ', err);
      // Fallback message if clipboard fails (sometimes due to permissions or missing HTTPS)
      showToast('failed to copy');
    }
  }
}

// Intercept events in the capture phase for maximum reliability
// 'click' covers standard clicks and keyboard 'Enter'
// 'auxclick' covers middle-clicks
// 'mousedown' catches many sites that trigger navigation early
['click', 'auxclick', 'mousedown'].forEach(eventType => {
  document.addEventListener(eventType, handleMailtoIntercept, true);
});

/**
 * Briefly illuminates the viewport edge to reinforce a successful copy action.
 */
async function showConfirmationPulse() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const existingPulse = document.getElementById('mailto-copy-confirmation-pulse');
  if (existingPulse) {
    existingPulse.mailtoCopyRemove?.();
  }

  const pulse = document.createElement('div');
  pulse.id = 'mailto-copy-confirmation-pulse';
  pulse.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pulse);

  let hasRemovedPulse = false;
  let pulseRemovalTimeout;
  const removePulse = () => {
    if (hasRemovedPulse) {
      return;
    }
    hasRemovedPulse = true;
    clearTimeout(pulseRemovalTimeout);
    pulse.mailtoCopyShaderMount?.dispose();
    pulse.remove();
  };
  pulse.mailtoCopyRemove = removePulse;

  try {
    const shaderMount = await window.MailtoCopyPaperShader.mountPulsingBorder(pulse, SHADER_SETTINGS);
    if (hasRemovedPulse) {
      shaderMount.dispose();
      return;
    }

    pulse.mailtoCopyShaderMount = shaderMount;
    pulse.addEventListener('animationend', removePulse, { once: true });
    requestAnimationFrame(() => {
      if (!hasRemovedPulse) {
        pulse.classList.add('show');
        pulseRemovalTimeout = setTimeout(removePulse, PULSE_DURATION_MS + 100);
      }
    });
  } catch (error) {
    console.warn('Mailto:Copy: Unable to render confirmation shader.', error);
    removePulse();
  }
}

/**
 * Plays Cuelume's MIT-licensed "success" cue. See THIRD_PARTY_NOTICES.md.
 */
async function playSuccessSound() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    return;
  }

  try {
    successAudioContext ||= new AudioContextConstructor();
  } catch {
    return;
  }

  const play = () => {
    if (successAudioContext.state === 'running') {
      renderSuccessSound(successAudioContext);
    }
  };

  if (successAudioContext.state === 'running') {
    play();
  } else {
    try {
      await successAudioContext.resume();
      play();
    } catch {
      // Ignore blocked audio playback; the copy action has already completed.
    }
  }
}

function renderSuccessSound(context) {
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.value = 0.5;
  master.connect(context.destination);

  const delay = context.createDelay(1);
  delay.delayTime.value = 0.1;
  const feedbackFilter = context.createBiquadFilter();
  feedbackFilter.type = 'lowpass';
  feedbackFilter.frequency.value = 4500;
  const feedbackGain = context.createGain();
  feedbackGain.gain.value = 0.22;
  const wetGain = context.createGain();
  wetGain.gain.value = 0.16;

  master.connect(delay);
  delay.connect(feedbackFilter);
  feedbackFilter.connect(feedbackGain);
  feedbackGain.connect(delay);
  feedbackFilter.connect(wetGain);
  wetGain.connect(context.destination);

  [
    { frequency: 880, offset: 0, decay: 0.09, peak: 0.06 },
    { frequency: 1108.73, offset: 0.06, decay: 0.1, peak: 0.06 },
    { frequency: 1318.51, offset: 0.12, decay: 0.18, peak: 0.07 },
  ].forEach(({ frequency, offset, decay, peak }) => {
    const startTime = now + offset;
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.004 + decay);

    oscillator.connect(gain).connect(master);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.004 + decay + 0.05);
  });

  setTimeout(() => {
    master.disconnect();
    delay.disconnect();
    feedbackFilter.disconnect();
    feedbackGain.disconnect();
    wetGain.disconnect();
  }, 1100);
}

/**
 * Creates and displays a premium, modern toast notification
 * @param {string} message - The message to display
 */
function showToast(message) {
  // Clear any pending removal or hide timers to allow the animation to continue/reset
  clearTimeout(toastHideTimeout);
  clearTimeout(toastRemovalTimeout);

  let toast = document.getElementById('mailto-copy-toast');
  
  if (!toast) {
    // Create the toast container if it doesn't exist
    toast = document.createElement('div');
    toast.id = 'mailto-copy-toast';
    toast.innerHTML = `<div class="mailto-toast-text"></div>`;
    document.body.appendChild(toast);
    
    // Trigger animation next frame for the very first appearance
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  } else {
    // If it already exists (possibly in mid-animation), just ensure the 'show' class is present
    // CSS transitions will handle the smooth continuation from its current state
    toast.classList.add('show');
  }

  // Update the message content
  const textElement = toast.querySelector('.mailto-toast-text');
  if (textElement) {
    textElement.textContent = message;
  }
  
  // Hide after 3 seconds of inactivity
  toastHideTimeout = setTimeout(() => {
    const activeToast = document.getElementById('mailto-copy-toast');
    if (activeToast) {
      activeToast.classList.remove('show');
      
      // Wait for the exit transition (500ms) to complete before removing from DOM
      toastRemovalTimeout = setTimeout(() => {
        if (activeToast.parentNode && !activeToast.classList.contains('show')) {
          activeToast.parentNode.removeChild(activeToast);
        }
      }, 500);
    }
  }, 3000);
}
