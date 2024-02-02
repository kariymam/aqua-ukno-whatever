const path = require("path");
const markdownIt = require("markdown-it");
const { minify } = require("terser");
const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const collections = require('./utils/collections.js')
const excerpt = require('./utils/excerpt.js');

module.exports = function (eleventyConfig) {
	// Folders to copy to build dir (See. 1.1)
	eleventyConfig.addPassthroughCopy("src/static");
	eleventyConfig.addPassthroughCopy("./src/fonts/");
	eleventyConfig.addPassthroughCopy({ "src/blog/writing/img/*": "img" });
	eleventyConfig.addPassthroughCopy({ "src/blog/work/img/*": "img" });
	eleventyConfig.addPassthroughCopy({ "src/blog/writing/img/*": "img" });
	eleventyConfig.addPassthroughCopy({ "src/blog/writing/img/*": "blog/writing/img" });
	eleventyConfig.addPassthroughCopy({ "src/blog/work/img/*": "blog/work/img" });

	// Filters
	Object.keys(filters).forEach((filterName) => {
		eleventyConfig.addFilter(filterName, filters[filterName])
	})

	// Async filter
	eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
		code,
		callback
	) {
		try {
			const minified = await minify(code);
			callback(null, minified.code);
		} catch (err) {
			console.error("Terser error: ", err);
			callback(null, code);
		}
	});

	// Transforms
	Object.keys(transforms).forEach((transformName) => {
		eleventyConfig.addTransform(transformName, transforms[transformName])
	})

	// Collections
	Object.keys(collections).forEach((collectionName) => {
		eleventyConfig.addCollection(collectionName, collections[collectionName])
	})

	// Plugins
	const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
	eleventyConfig.addPlugin(eleventyNavigationPlugin);

	const pluginImages = require("./utils/images.js");
	eleventyConfig.addPlugin(pluginImages);

	eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
  });

	eleventyConfig.addShortcode('excerpt', (post) => {
    return excerpt(post);
  });

	// Drafts
	// When `permalink` is false, the file is not written to disk
	eleventyConfig.addGlobalData("eleventyComputed.permalink", function() {
		return (data) => {
			// Always skip during non-watch/serve builds
			if(data.draft && !process.env.BUILD_DRAFTS) {
				return false;
			}

			return data.permalink;
		}
	});

  // When `eleventyExcludeFromCollections` is true, the file is not included in any collections
	eleventyConfig.addGlobalData("eleventyComputed.eleventyExcludeFromCollections", function() {
		return (data) => {
			// Always exclude from non-watch/serve builds
			if(data.draft && !process.env.BUILD_DRAFTS) {
				return true;
			}

			return data.eleventyExcludeFromCollections;
		}
	});

	eleventyConfig.on("eleventy.before", ({runMode}) => {
		// Set the environment variable
		if(runMode === "serve" || runMode === "watch") {
			process.env.BUILD_DRAFTS = true;
		}
	});

	// This allows Eleventy to watch for file changes during local development.
	eleventyConfig.setUseGitIgnore(false);

	// Watch Targets
	eleventyConfig.addWatchTarget('./src/_assets/stylesheets/');
	eleventyConfig.addWatchTarget('./src/_assets/scripts/');
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	return {
		dir: {
			input: "src/",
			output: "dist",
			includes: "_includes",
			data: "_data",
			layouts: "_layouts"
		},
		templateFormats: ["html", "md", "njk"],
		htmlTemplateEngine: "njk"

		// // 1.1 Enable eleventy to pass dirs specified above
		// passthroughFileCopy: true
	};
};
