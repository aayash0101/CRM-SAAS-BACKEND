import { customersRepository } from './customers.repository';
import { AppError } from '@common/middleware/error.middleware';
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFiltersInput,
} from './customers.validation';

type CallerRole = string;

export class CustomersService {
  async createCustomer(
    organizationId: string,
    callerRole: CallerRole,
    input: CreateCustomerInput
  ) {
    if (callerRole === 'SALES_REP') {
      throw new AppError('Sales reps cannot create customers directly', 403);
    }

    return customersRepository.create({
      ...input,
      organizationId,
    });
  }

  async getAllCustomers(
    organizationId: string,
    filters: CustomerFiltersInput
  ) {
    const { customers, total } = await customersRepository.findAllByOrg(
      organizationId,
      filters
    );

    const { page = 1, limit = 20 } = filters;

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string, organizationId: string) {
    const customer = await customersRepository.findByIdAndOrg(id, organizationId);
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  async updateCustomer(
    id: string,
    organizationId: string,
    callerRole: CallerRole,
    input: UpdateCustomerInput
  ) {
    if (callerRole === 'SALES_REP') {
      throw new AppError('Sales reps cannot update customer records', 403);
    }

    const customer = await customersRepository.findByIdAndOrg(id, organizationId);
    if (!customer) throw new AppError('Customer not found', 404);

    return customersRepository.update(id, input);
  }

  async deleteCustomer(
    id: string,
    organizationId: string,
    callerRole: CallerRole
  ) {
    if (callerRole !== 'ORG_ADMIN') {
      throw new AppError('Only organization admins can delete customers', 403);
    }

    const customer = await customersRepository.findByIdAndOrg(id, organizationId);
    if (!customer) throw new AppError('Customer not found', 404);

    await customersRepository.delete(id);
  }

  async getCustomerStats(organizationId: string) {
    const total = await customersRepository.countByOrg(organizationId);
    return { total };
  }
}

export const customersService = new CustomersService();