import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as yup from 'yup';

import { PetsProvider } from './../../database/providers/pets';
import { validation } from '../../shared/middleware';


interface IQueryProps {
  id?: number;
  page?: number;
  limit?: number;
  filter?: string;
}
export const getAllValidation = validation(get => ({
  query: get<IQueryProps>(yup.object().shape({
    filter: yup.string().optional().default(''),
    id: yup.number().integer().optional().default(0),
    page: yup.number().integer().optional().moreThan(0).default(1),
    limit: yup.number().integer().optional().moreThan(0).default(7),
  })),
}));

export const getAll = async (req: Request<{}, {}, {}, IQueryProps>, res: Response) => {
  const result = await PetsProvider.getAll(req.query.page || 1, req.query.limit || 7, req.query.filter || '');
  const count = await PetsProvider.count(req.query.filter);


  console.log('idUsuario', req.headers.idUsuario);
  if (result instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: { default: result.message }
    });
  } else if (count instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: { default: count.message }
    });
  }

  res.setHeader('access-control-expose-headers', 'x-total-count');
  res.setHeader('x-total-count', count);

  return res.status(StatusCodes.OK).json(result);
};
