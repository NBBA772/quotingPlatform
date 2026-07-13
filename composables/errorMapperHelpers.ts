// errorMapperHelpers.ts
export function getMappedZodErrors(zodError: any) {
  const errors = new Map<string, { message: string }>();
  let parsedErrors: any[] = [];

  if (Array.isArray(zodError)) {
    parsedErrors = zodError;
  } else if (zodError?.errors) {
    parsedErrors = zodError.errors;
  } else {
    parsedErrors = [{ path: ["unknown"], message: zodError?.message ?? "Unknown error" }];
  }

  parsedErrors.forEach((err: any) => {
    errors.set(err.path?.[0] ?? "unknown", { message: err.message });
  });

  return Object.fromEntries(errors);
}

export function getMappedError(errorType: string, message: string) {
  const errors = new Map<string, { message: string }>();
  errors.set(errorType, { message });
  return Object.fromEntries(errors);
}
