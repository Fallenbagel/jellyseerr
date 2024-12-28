import Button from '@app/components/Common/Button';
import Modal from '@app/components/Common/Modal';
import Table from '@app/components/Common/Table';
import { Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { AutoApprovalRule } from '@server/lib/autoapproval';
import { useState } from 'react';
import Select from 'react-select';

type OptionType = { value: number; label: string; exists: boolean };

interface RuleModalProps {
  approvalRule: AutoApprovalRule | null;
  onClose: () => void;
  onSave: () => void;
}

const GenreCondition = (comparison = 'is', values) => {
  const genreOptions = [
    { label: 'Action', value: 0 },
    { label: 'Comedy', value: 1 },
    { label: 'Documentary', value: 2 },
    { label: 'Romance', value: 3 },
    { label: 'Drama', value: 4 },
  ];
  return (
    <div>
      <Table.TD>
        <select
          id="condition-type"
          name="condition-type"
          className=""
          defaultValue={comparison}
        >
          <option value="is">is</option>
          <option value="isnot">is not</option>
          <option value="contains">contains</option>
          <option value="containsnot">does not contain</option>
        </select>
      </Table.TD>
      <Table.TD>
        <Select<OptionType, true>
          options={genreOptions}
          isMulti
          className="react-select-container rounded-r-only"
          classNamePrefix="react-select"
          defaultValue={genreOptions.filter((genre) =>
            typeof values == 'number'
              ? genre.value == values
              : values.includes(genre.value)
          )}
        />
      </Table.TD>
    </div>
  );
};

const ReleaseYearCondition = (comparison = 'equals') => {
  const options = [
    { value: 'equals', text: '=' },
    { value: 'greaterthan', text: '>' },
    { value: 'lessthan', text: '<' },
  ];
  const optionsContent = options.map((option) => (
    <option key={`condition-release-`} value={option.value}>
      {option.text}
    </option>
  ));
  return (
    <select
      key="mykey"
      id="comparison-type"
      name="comparison-type"
      className="rounded-r-only"
      defaultValue={comparison}
    >
      {optionsContent}
    </select>
  );
};

const ConditionItem = (
  defaultImplementation: string,
  comparison = '',
  values: any
) => {
  const [implementation, setImplementation] = useState(defaultImplementation);
  return (
    <tr
      key="approval-rule-condition-0"
      data-testid="approval-condition-list-row"
    >
      <Table.TD>
        <select
          id="implementation"
          name="implementation"
          value={implementation}
          onChange={(e) => setImplementation(e.target.value)}
        >
          <option value="genre">Genre</option>
          <option value="release-year">Release Year</option>
        </select>
      </Table.TD>
      <Table.TD>
        {
          {
            genre: GenreCondition(comparison, values),
            'release-year': ReleaseYearCondition(comparison),
          }[implementation]
        }
      </Table.TD>
    </tr>
  );
};

const RuleModal = ({ onClose, approvalRule }: RuleModalProps) => {
  const conditionsList = approvalRule?.conditions.map((condition) =>
    ConditionItem(
      condition.implementation,
      condition.comparisonType,
      condition.value
    )
  );
  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity ease-in-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-in-out duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Modal
        onCancel={onClose}
        okButtonType="primary"
        okText="Add"
        title="Add Auto Approval Rule"
      >
        <div className="mb-6">
          <h2>This is a modal</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Table.TH>Condition</Table.TH>
              <Table.TH></Table.TH>
            </tr>
          </thead>
          <Table.TBody>
            {conditionsList}
            <tr className="rounded-lg border-2 border-dashed border-gray-400 shadow">
              <Table.TD
                colSpan={3}
                className="rounded-r-only border-2 border-dashed border-gray-400"
              >
                <div className="flex w-screen flex-col items-center sm:space-y-0 lg:w-full">
                  <Button
                    buttonType="ghost"
                    className="lg:justify-y-center flex justify-center"
                  >
                    <PlusIcon />
                    <span> Add Condition</span>
                  </Button>
                </div>
              </Table.TD>
            </tr>
          </Table.TBody>
        </Table>
      </Modal>
    </Transition>
  );
};

export default RuleModal;
