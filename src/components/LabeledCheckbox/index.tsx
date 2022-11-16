import { Field } from 'formik';

interface LabeledCheckboxProps {
  id: string;
  label: string;
  description: string;
  onChange: () => void;
  children?: React.ReactNode;
}

const LabeledCheckbox: React.FC<LabeledCheckboxProps> = ({
  id,
  label,
  description,
  onChange,
  children,
}) => {
  return (
    <>
      <div className={`relative mt-4 flex items-start first:mt-0`}>
        <div className="flex h-6 items-center">
          <Field type="checkbox" id={id} name={id} onChange={onChange} />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="localLogin" className="block">
            <div className="flex flex-col">
              <span className="font-medium text-white">{label}</span>
              <span className="font-normal text-gray-400">{description}</span>
            </div>
          </label>
        </div>
      </div>
      {
        /* can hold child checkboxes */
        children && <div className="mt-4 pl-10">{children}</div>
      }
    </>
  );
};

export default LabeledCheckbox;
