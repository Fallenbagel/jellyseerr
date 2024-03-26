import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { FormikErrors } from 'formik';
import { useFormikContext } from 'formik';

const getFieldErrorNames = (formikErrors: FormikErrors<unknown>) => {
  const transformObjectToDotNotation = (
    obj: FormikErrors<unknown>,
    prefix = '',
    result: string[] = []
  ) => {
    (Object.keys(obj) as (keyof typeof obj)[]).forEach((key) => {
      const value = obj[key];
      if (!value) return;

      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object') {
        transformObjectToDotNotation(value, nextKey, result);
      } else {
        result.push(nextKey);
      }
    });

    return result;
  };

  return transformObjectToDotNotation(formikErrors);
};

const FormErrorNotification = () => {
  const { isValid, errors } = useFormikContext();

  const scrollToError = () => {
    const fieldErrorNames = getFieldErrorNames(errors);
    if (fieldErrorNames.length <= 0) return;

    let firstErrorFieldName = fieldErrorNames[0];
    if (firstErrorFieldName.includes('|'))
      firstErrorFieldName = firstErrorFieldName.split('|')[0].trim();

    const element = document.querySelector(
      `input[name='${firstErrorFieldName}']`
    );
    if (!element) return;

    // Scroll to first known error into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (!isValid)
    return (
      <ExclamationCircleIcon
        className="h-6 w-6 cursor-pointer text-red-500"
        onClick={scrollToError}
      />
    );

  return null;
};

export default FormErrorNotification;
