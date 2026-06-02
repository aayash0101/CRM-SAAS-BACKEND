import { Request, Response, NextFunction } from 'express';
import { customersService } from './customers.service';
import { sendSuccess, sendCreated } from '@common/utils/apiResponse.utils';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerFiltersSchema,
} from './customers.validation';

export class CustomersController {
  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createCustomerSchema.parse(req.body);
      const data = await customersService.createCustomer(
        req.user!.organizationId,
        req.user!.role,
        body
      );
      sendCreated(res, data, 'Customer created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = customerFiltersSchema.parse(req.query);
      const { customers, meta } = await customersService.getAllCustomers(
        req.user!.organizationId,
        filters
      );
      sendSuccess(res, customers, 'Customers retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customersService.getCustomerById(
        req.params.id as string,
        req.user!.organizationId
      );
      sendSuccess(res, data, 'Customer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateCustomerSchema.parse(req.body);
      const data = await customersService.updateCustomer(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.role,
        body
      );
      sendSuccess(res, data, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      await customersService.deleteCustomer(
        req.params.id as string,
        req.user!.organizationId,
        req.user!.role
      );
      sendSuccess(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCustomerStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customersService.getCustomerStats(req.user!.organizationId);
      sendSuccess(res, data, 'Customer stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const customersController = new CustomersController();