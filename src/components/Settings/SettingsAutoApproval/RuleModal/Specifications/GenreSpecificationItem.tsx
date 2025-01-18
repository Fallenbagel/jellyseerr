import Table from '@app/components/Common/Table';
import { GenreSelector } from '@app/components/Selector';

interface GenreSpecificationItemProps {
  currentValue: string;
  isMovie: boolean;
  comparator: string;
}
export default function GenreSpecificationItem({
  currentValue,
  isMovie,
  comparator,
}: GenreSpecificationItemProps) {
  const comparatorOptions = [
    { label: 'is', value: 'is' },
    { label: 'is not', value: 'isnot' },
    { label: 'contains', value: 'contains' },
    { label: 'does not contain', value: 'containsnot' },
  ];
  const comparatorItems = comparatorOptions.map((item) => (
    <option value={item.value}>{item.label}</option>
  ));
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
        <GenreSelector
          type={isMovie ? 'movie' : 'tv'}
          isMulti
          defaultValue={currentValue}
          onChange={() => {
            return;
          }}
        />
      </Table.TD>
    </>
  );
}
