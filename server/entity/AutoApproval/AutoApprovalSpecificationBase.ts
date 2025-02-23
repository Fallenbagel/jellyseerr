class AutoApprovalSpecificationBase {
  public implementationName: string;
  public comparator: string;
  public value: unknown;

  isSatisfiedBy(): boolean {
    return false;
  }
}

export default AutoApprovalSpecificationBase;
