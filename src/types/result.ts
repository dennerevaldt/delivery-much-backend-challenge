export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean
  public error: T | string;
  private _value: T;

  public constructor (isSuccess: boolean, error?: string | T, value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }

    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;

    Object.freeze(this);
  }

  public getValue () : T {
    if (!this.isSuccess) {
      return this.error as T;
    }

    return this._value;
  }
}
