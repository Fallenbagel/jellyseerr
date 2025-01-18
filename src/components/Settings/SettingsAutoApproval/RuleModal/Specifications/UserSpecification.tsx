import Table from '@app/components/Common/Table';
import { UserSelector } from '@app/components/Selector';

interface UserSpecificationItemProps {
  currentValue: number;
  comparator: string;
}

export default function UserSpecificationItem({
  currentValue,
  comparator,
}: UserSpecificationItemProps) {
  const comparatorItems = [
    { label: 'is', value: 'is' },
    { label: 'is not', value: 'isnot' },
    { label: 'contains', value: 'contains' },
    { label: 'does not contain', value: 'containsnot' },
  ].map((item) => <option value={item.value}>{item.label}</option>);
  return (
    <>
      <Table.TD>
        <select
          id="condition-type"
          name="condition-type"
          className=""
          defaultValue={comparator}
        >
          {comparatorItems}
        </select>
      </Table.TD>
      <Table.TD>
        <UserSelector
          isMulti
          defaultValue={currentValue.toString()}
          onChange={() => {
            return;
          }}
        />
      </Table.TD>
    </>
  );
}
