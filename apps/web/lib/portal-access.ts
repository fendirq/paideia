export function canAccessWritingPortal(capabilities: string[]) {
  return capabilities.includes("student") || capabilities.includes("writing_portal");
}
