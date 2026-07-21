
const m = 1;
const k = 115.2;
const c = 24;
const duration = 0.4; // seconds

const wn = Math.sqrt(k / m);
const zeta = c / (2 * Math.sqrt(m * k));

function position(t) {
    if (zeta < 1) {
        // Underdamped
        const wd = wn * Math.sqrt(1 - zeta * zeta);
        return 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + (zeta * wn / wd) * Math.sin(wd * t));
    } else if (zeta === 1) {
        // Critically damped
        return 1 - Math.exp(-wn * t) * (1 + wn * t);
    } else {
        // Overdamped
        const wd = wn * Math.sqrt(zeta * zeta - 1);
        return 1 - Math.exp(-zeta * wn * t) * (Math.cosh(wd * t) + (zeta * wn / wd) * Math.sinh(wd * t));
    }
}

const steps = 50;
const points = [];
for (let i = 0; i <= steps; i++) {
    const t_norm = i / steps;
    const t = t_norm * duration;
    // We want the easing to be normalized to 1 at the end of the duration if possible, 
    // but a spring might take longer to settle. 
    // However, the linear() function expects input from 0 to 1 mapping to output.
    // CSS linear() input [0, 1] maps to time in the transition duration.
    // So if the transition-duration is 0.5s, then x=1 in linear() is t=0.5s.
    const pos = position(t);
    points.push(pos.toFixed(4));
}

console.log(`linear(${points.join(', ')})`);
