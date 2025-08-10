
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy({"src/static": "/"});

  eleventyConfig.addFilter("json", obj => JSON.stringify(obj));
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tags = new Set();
    collectionApi.getFilteredByGlob("src/posts/*.md").forEach(item => {
      (item.data.tags || []).forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  });

  
eleventyConfig.addCollection("livePosts", function(collectionApi) {
  const now = new Date();
  return collectionApi.getFilteredByGlob("src/posts/*.md").filter(item => {
    const data = item.data || {};
    const isDraft = !!data.draft;
    const isFuture = item.date && (item.date > now);
    return !isDraft && !isFuture;
  }).sort((a,b)=>a.date-b.date);
});

return {

    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk","md","html","liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
