import type { NextFunction, Request, Response } from 'express'

export function asyncRoute<Req extends Request = Request>(
  handler: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req as Req, res, next).catch(next)
  }
}
