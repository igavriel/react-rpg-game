import ErrorService from "../server/services/error.service";
import { ColorLogger as Logger } from "./colorLogger";
import { Response } from "express";

function buildError(code: number, message: string, res: Response<any, Record<string, any>>) {
  const error = new ErrorService(code, message);
  Logger.error(`${error.errorCode}: ${error.errorMessage}`);
  res.status(error.errorCode).json(error.error);
}

export default buildError;