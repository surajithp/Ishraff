export const slugifyString = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/-+/g, "-")
    .replace(/[^a-z0-9-]/g, "-");
};
