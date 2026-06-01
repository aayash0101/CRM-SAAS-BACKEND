import { organizationsRepository } from './organizations.repository';
import { UpdateOrganizationInput } from './organizations.validation';
import { OrganizationWithSubscriptionDto } from './organizations.dto';
import { AppError } from '@common/middleware/error.middleware';

export class OrganizationsService {
  async getOrganization(
    organizationId: string
  ): Promise<OrganizationWithSubscriptionDto> {
    const org = await organizationsRepository.findById(organizationId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      email: org.email,
      phone: org.phone,
      website: org.website,
      logoUrl: org.logoUrl,
      address: org.address,
      city: org.city,
      country: org.country,
      status: org.status,
      createdAt: org.createdAt,
      subscription: org.subscription
        ? {
            id: org.subscription.id,
            plan: org.subscription.plan,
            status: org.subscription.status,
            currentPeriodStart: org.subscription.currentPeriodStart,
            currentPeriodEnd: org.subscription.currentPeriodEnd,
          }
        : null,
    };
  }

  async updateOrganization(
    organizationId: string,
    input: UpdateOrganizationInput
  ): Promise<OrganizationWithSubscriptionDto> {
    const org = await organizationsRepository.findById(organizationId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    const updated = await organizationsRepository.update(organizationId, input);

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      email: updated.email,
      phone: updated.phone,
      website: updated.website,
      logoUrl: updated.logoUrl,
      address: updated.address,
      city: updated.city,
      country: updated.country,
      status: updated.status,
      createdAt: updated.createdAt,
      subscription: updated.subscription
        ? {
            id: updated.subscription.id,
            plan: updated.subscription.plan,
            status: updated.subscription.status,
            currentPeriodStart: updated.subscription.currentPeriodStart,
            currentPeriodEnd: updated.subscription.currentPeriodEnd,
          }
        : null,
    };
  }

  async getOrganizationStats(organizationId: string) {
    return organizationsRepository.getStats(organizationId);
  }
}

export const organizationsService = new OrganizationsService();