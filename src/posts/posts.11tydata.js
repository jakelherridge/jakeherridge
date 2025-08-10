
module.exports = {
  eleventyComputed: {
    eleventyExcludeFromCollections: (data) => {
      const isDraft = !!data.draft;
      const date = new Date(data.date || Date.now());
      const now = new Date();
      return isDraft || date > now;
    }
  }
}
