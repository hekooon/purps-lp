// Rolling digits, the same as the app's: each character sits in its own
// slot, and a digit that changes slides out as the new one slides in, up
// when the number rises and down when it falls, staggered from the right.
// Anything that isn't a digit swaps instantly. If the shape of the number
// changes (another digit, say), it's just set outright.
// Each digit moves a third of its height, blurring as it goes, and fades
// out at the top and bottom of its place. The element needs the `rolling`
// class for the slot styles (global.css).
const DISTANCE = 35;
const BLUR = 6;
const SLIDE = { duration: 620, easing: 'cubic-bezier(.22,1,.28,1)', fill: 'both' } as const;
const STAGGER = 30;
const shape = (t: string) => t.replace(/\d/g, '#');
const isDigit = (ch: string) => ch >= '0' && ch <= '9';
type Slot = HTMLSpanElement & { glyph: HTMLSpanElement; digit: boolean };
const rolls = new WeakMap<HTMLElement, string>();
export const roll = (el: HTMLElement, text: string) => {
	const was = rolls.get(el);
	if (was === text) return;
	rolls.set(el, text);
	if (!was || shape(was) !== shape(text)) {
		el.replaceChildren(
			...[...text].map((ch) => {
				const slot = document.createElement('span') as Slot;
				slot.className = 'slot';
				slot.digit = isDigit(ch);
				slot.glyph = document.createElement('span');
				slot.glyph.textContent = ch;
				slot.append(slot.glyph);
				return slot;
			}),
		);
		return;
	}
	const value = (t: string) => parseFloat(t.replace(/[^0-9.-]/g, '')) || 0;
	const up = value(text) >= value(was);
	const slots = [...el.children] as Slot[];
	const digits = (text.match(/\d/g) ?? []).length;
	let seen = 0;
	slots.forEach((slot, i) => {
		const ch = text[i];
		if (!slot.digit) {
			slot.glyph.textContent = ch;
			return;
		}
		seen++;
		const old = slot.glyph;
		if (old.textContent === ch) return;
		// Never more than the outgoing and incoming digit in a slot
		slot.querySelectorAll('.out').forEach((n) => n.remove());
		old.getAnimations().forEach((a) => a.finish());
		const glyph = document.createElement('span');
		glyph.textContent = ch;
		old.classList.add('out');
		slot.append(glyph);
		slot.glyph = glyph;
		const timing = { ...SLIDE, delay: (digits - seen) * STAGGER };
		const shift = up ? DISTANCE : -DISTANCE;
		const soft = `blur(${BLUR}px)`;
		glyph.animate(
			[
				{ transform: `translateY(${shift}%)`, opacity: 0, filter: soft },
				{ transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' },
			],
			timing,
		);
		old
			.animate(
				[
					{ transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' },
					{ transform: `translateY(${-shift}%)`, opacity: 0, filter: soft },
				],
				timing,
			)
			.finished.then(() => old.remove())
			.catch(() => {});
	});
};
