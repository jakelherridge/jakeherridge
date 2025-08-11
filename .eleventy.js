
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

// ----- Date filter (works in Nunjucks & Liquid) -----
function dateFilter(value, format = "") {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");

  if (format === "yyyy-MM-dd") return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  if (format === "MMM d, yyyy")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (format === "yyyy") return String(d.getFullYear());
  return d.toISOString();
}

eleventyConfig.addFilter("date", dateFilter);          // universal
eleventyConfig.addNunjucksFilter("date", dateFilter);  // explicit for Nunjucks
eleventyConfig.addLiquidFilter("date", dateFilter);    // explicit for Liquid (harmless)


return {

    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk","md","html","liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
