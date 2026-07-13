import { getMappedZodErrors, getMappedError } from "./errorMapperHelpers";

export default function useErrorMapper(error: any) {
  if (!error) {
    return {
      hasErrors: true,
      errors: { unknown: { message: "Unknown error" } },
    };
  }

  // If it's a Zod-like error
  if (error.errors || Array.isArray(error)) {
    return {
      hasErrors: true,
      errors: getMappedZodErrors(error),
    };
  }

  // If it's a string (possibly JSON from API)
  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error);
      return { hasErrors: true, errors: getMappedZodErrors(parsed) };
    } catch {
      return {
        hasErrors: true,
        errors: getMappedError("general", error),
      };
    }
  }

  // 🔽 Handle Authentication error from backend
  if (error.Authentication && error.Authentication.message === "Invalid Credentials") {
    return {
      hasErrors: true,
      errors: getMappedError("general", "Incorrect username or password."),
    };
  }

  // Fallback generic error
  return {
    hasErrors: true,
    errors: getMappedError("general", error.message ?? "Unknown error"),
  };
}