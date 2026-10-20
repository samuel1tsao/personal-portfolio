export function log(level: "info" | "error" | "debug", message: string, fields = {}) {
  console[level](JSON.stringify({ event: message, ...fields }));
}
