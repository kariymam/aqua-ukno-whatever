	// Source: https://www.belenalbeza.com/articles/better-excerpts-in-eleventy/
	// Source: https://jonathanyeong.com/excerpts-with-eleventy/#:~:text=Cap%20at%20200%20characters,no%20need%20for%20specific%20tags.
	const striptags = require("striptags");
	const markdownIt = require('markdown-it');
	const arrow = "\u2192"

	module.exports = function async (post) {
		let excerpt = post.data?.page?.excerpt;
		let content = post.templateContent;

		excerpt = striptags(content)
			.substring(0, 150)
			.replace(/^\\s+|\\s+$|\\s+(?=\\s)/g, "")
			.trim();

		if (content.length > 150) {
			excerpt = excerpt.concat("...");

		}

		return markdownIt({ html: true }).render(`${excerpt} <span class="text-sm whitespace-nowrap">Read more ${arrow}</span>`);
	};
