import { IError } from "../models/error.model";

export class ErrorService {
  protected _error: IError;

  constructor(data: IError);
  constructor(code: number, message: string);
  constructor(codeOrData: number| IError, message?: string) {
      if (typeof codeOrData === 'number' &&
          typeof message === 'string') {
          this._error = { code: codeOrData, message };
      } else if (typeof codeOrData === 'object') {
          this._error = { ...codeOrData };
      } else {
          throw new Error('Invalid constructor arguments');
      }
  }

  get error() : IError {
    return this._error;
  }

  get errorCode() : number {
    return this._error.code;
  }

  get errorMessage() : string {
    return this._error.message;
  }
}

export default ErrorService;