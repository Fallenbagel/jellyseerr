import AutoApprovalSpecificationBase from '@server/entity/AutoApproval/AutoApprovalSpecificationBase';

class GenreSpecification extends AutoApprovalSpecificationBase {
  public implementationName = 'genre';
  public isSatisfiedBy(): boolean {
    return false;
  }

  public value: string;

  public comparator = 'is';
  public constructor(comparator?: string, value?: string) {
    super();
    this.comparator = comparator ?? 'is';
    this.value = value ?? '';
  }
}

export default GenreSpecification;
