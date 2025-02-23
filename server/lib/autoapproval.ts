import type AutoApprovalSpecificationBase from '@server/entity/AutoApproval/AutoApprovalSpecificationBase';
export interface AutoApprovalRule {
  name: string;
  conditions: AutoApprovalSpecificationBase[];
}
