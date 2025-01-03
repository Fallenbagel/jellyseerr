export interface AutoApprovalRule {
  name: string;
  conditions: AutoApprovalCondition[];
}

export interface AutoApprovalCondition {
  implementation: string;
  comparisonType: string;
  value;
}
