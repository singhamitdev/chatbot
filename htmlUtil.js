import "../styles/global.css";
export const isFullHtmlDocument = (htmlString) => {
  if (!htmlString || typeof htmlString !== "string") return false;

  const lowerCaseHtml = htmlString.toLowerCase();

  return lowerCaseHtml.includes("<!doctype html>");
  // || lowerCaseHtml.includes("<html") ||
  // lowerCaseHtml.includes("<head") ||
  // lowerCaseHtml.includes("<body")
};

export const convertHtmlToMarkdown = (html) => {
  return html
    .replace(
      /<table/g,
      '<div class="table-scroll-wrapper"><table class="markdown-table"'
    )
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<th>/g, '<th class="markdown-th">')
    .replace(/<td/g, '<td class="markdown-td"')
    .replace(/<b>/g, '<b class="markdown-bold">')
    .replace(/<ul>/g, '<ul class="markdown-ul">')
    .replace(/<ol>/g, '<ol class="markdown-ol">')
    .replace(/<li>/g, '<li class="markdown-li">')
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
};

export const formatRole = (role) => {
  switch (role?.toLowerCase()) {
    case "developer":
      return "Developer";
    case "support":
      return "L3 Support Engineer";
    case "user":
      return "Business User";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
};
