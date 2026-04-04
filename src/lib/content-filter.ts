const STEM_SUBJECTS = new Set(["MATHEMATICS", "SCIENCE"]);
const NON_STEM_SUBJECTS = new Set(["ENGLISH", "HISTORY", "HUMANITIES"]);

function stripLatex(text: string): string {
  // Strip display math $$...$$ — keep inner content
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, "$1");

  // Strip inline math $...$ — keep inner content
  text = text.replace(/\$([^\$\n]+?)\$/g, "$1");

  // Strip common LaTeX commands, keep their content
  text = text.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
  text = text.replace(/\\textit\{([^}]*)\}/g, "*$1*");
  text = text.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2");
  text = text.replace(/\\sqrt\{([^}]*)\}/g, "sqrt($1)");

  // Remove remaining backslash commands (e.g., \int, \sum)
  text = text.replace(/\\[a-zA-Z]+/g, "");

  // Clean up extra whitespace from removals
  text = text.replace(/  +/g, " ").trim();

  return text;
}

export function filterResponseBySubject(
  text: string,
  subject: string
): string {
  if (STEM_SUBJECTS.has(subject)) {
    return text;
  }

  if (NON_STEM_SUBJECTS.has(subject)) {
    return stripLatex(text);
  }

  return text;
}
