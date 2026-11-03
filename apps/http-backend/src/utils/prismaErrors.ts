export const isUniqueViolation = (e: unknown) =>
    typeof e === "object" && e !== null && "code" in e && (e as { code: unknown }).code === "P2002";