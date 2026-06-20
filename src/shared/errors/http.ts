export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly title: string,
    public readonly detail: string,
    public readonly errors: Record<string, unknown> = {},
  ) {
    super(detail);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toResponse(instance: string) {
    return {
      code: this.code,
      title: this.title,
      status: this.status,
      detail: this.detail,
      instance,
      errors: this.errors,
    };
  }
}

export class ValidationError extends HttpError {
  constructor(errors: Record<string, string[] | undefined>) {
    const count = Object.keys(errors).length;
    super(
      400,
      'validation_failed',
      'Validation Failed',
      `${count} field(s) failed validation.`,
      errors,
    );
  }
}

export class InternalServerError extends HttpError {
  constructor(detail?: string) {
    super(
      500,
      'internal_server_error',
      'Internal Server Error',
      detail ?? 'An unexpected error occurred while processing the request.',
    );
  }
}
