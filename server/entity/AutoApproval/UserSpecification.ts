import AutoApprovalSpecificationBase from './AutoApprovalSpecificationBase';

class UserSpecification extends AutoApprovalSpecificationBase {
  public implementationName = 'user';
  public isSatisfiedBy(): boolean {
    return false;
  }
  public value: number;
  public comparator: string;
  public constructor(comparator?: string, value?: number) {
    super();
    this.comparator = comparator ?? 'is';
    this.value = value ?? 0;
  }
}

export default UserSpecification;
