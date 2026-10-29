// Typographic clean-up for every page's text, run on the finished HTML by
// src/middleware.ts so it covers all copy, wherever it's written. (The other
// half, never leaving a lone word on a last line, is `text-wrap: pretty` on
// the body in global.css.)

// Joins the first word of each sentence after the first to the word after
// it with a non-breaking space, so a line never ends on a sentence's lone
// opening word ("…you know. Don't / miss out…" becomes "…you know. /
// Don't miss out…"). Prices and the like ("$4.8K") have no space after the
// full stop, so they're left alone.
const SENTENCE_START = /([.!?])\s+(\S+)\s+(?=\S)/g;
const keepSentenceStarts = (text: string) => text.replace(SENTENCE_START, '$1 $2&nbsp;');

// Each match is either something to leave exactly as it is (a tag with its
// attributes, a comment, or a whole <script>, <style>, <pre> or <textarea>)
// or a run of text between tags, which gets the clean-up
const PARTS = /(<(script|style|pre|textarea)\b[\s\S]*?<\/\2>|<!--[\s\S]*?-->|<[^>]*>)|([^<]+)/gi;

export const polishHtml = (html: string) =>
	html.replace(PARTS, (match, _skip, _name, text?: string) =>
		text === undefined ? match : keepSentenceStarts(text),
	);
