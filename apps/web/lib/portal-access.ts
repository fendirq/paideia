export function normalizeCapabilities(capabilities: string[]) {
  return [...new Set(capabilities)].sort();
}

export function canAccessWritingPortal(capabilities: string[]) {
  const normalized = normalizeCapabilities(capabilities);
  return normalized.includes("student") || normalized.includes("writing_portal");
}
