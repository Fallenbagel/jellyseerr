import { AutoApprovalSpecificationBase } from '@server/entity/AutoApproval/AutoApprovalSpecificationBase';

class ReleaseYearSpecification extends AutoApprovalSpecificationBase {
  public implementationName = 'releaseyear';
  public comparator = 'equals';
  public value: string;
  public options = [
    { value: 'equals', text: '=' },
    { value: 'equalsnot', text: '!=' },
    { value: 'greaterthan', text: '>' },
    { value: 'lessthan', text: '<' },
  ];
  public optionsContent;
  constructor(comparison: string, value?: string) {
    super({});
    this.comparator = comparison;
    this.value = value ?? '';
    this.optionsContent = this.options.map((option) => (
      <option key={'condition-release'} value={option.value}>
        {option.text}
      </option>
    ));
  }
  public Component = () => {
    return (
      <>
        <select
          key="mykey"
          id="comparison-type"
          name="comparison-type"
          className="rounded-r-only"
          defaultValue={this.comparator}
        >
          {this.optionsContent}
          {}
        </select>
        <input type="text"></input>
      </>
    );
  };
}

export default ReleaseYearSpecification;
