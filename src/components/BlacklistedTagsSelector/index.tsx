import Modal from '@app/components/Common/Modal';
import Tooltip from '@app/components/Common/Tooltip';
import { encodeURIExtraParams } from '@app/hooks/useDiscover';
import defineMessages from '@app/utils/defineMessages';
import { Transition } from '@headlessui/react';
import {
  ArrowDownIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/solid';
import type { TmdbKeywordSearchResponse } from '@server/api/themoviedb/interfaces';
import type { Keyword } from '@server/models/common';
import { useFormikContext } from 'formik';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import type { ClearIndicatorProps, GroupBase, MultiValue } from 'react-select';
import { components } from 'react-select';
import AsyncSelect from 'react-select/async';
import { useToasts } from 'react-toast-notifications';
import useClipboard from 'react-use-clipboard';

const messages = defineMessages('components.Settings', {
  copyBlacklistedTags: 'Copied blacklisted tags to clipboard.',
  copyBlacklistedTagsTip: 'Copy blacklisted tags configuration',
  importBlacklistedTagsTip: 'Import blacklisted tags configuration',
  clearBlacklistedTagsConfirm:
    'Are you sure you want to clear the blacklisted tags?',
  yes: 'Yes',
  no: 'No',
  searchKeywords: 'Search keywords…',
  starttyping: 'Starting typing to search.',
  nooptions: 'No results.',
  blacklistedTagImportTitle: 'Import Blacklist Tag Configuration',
  blacklistedTagImportInstructions: 'Paste blacklist tag configuration below.',
  valueRequired: 'You must provide a value.',
  noSpecialCharacters:
    'Configuration must be a comma delimited list of TMDB keyword ids, and must not start or end with a comma.',
  invalidKeyword: '{keywordId} is not a TMDB keyword.',
});

type SingleVal = {
  label: string;
  value: number;
};

type BlacklistedTagsSelectorProps = {
  defaultValue?: string;
};

const BlacklistedTagsSelector = ({
  defaultValue,
}: BlacklistedTagsSelectorProps) => {
  const { setFieldValue } = useFormikContext();
  const [value, setValue] = useState<string | undefined>(defaultValue);
  const [selectorValue, setSelectorValue] =
    useState<MultiValue<SingleVal> | null>(null);

  const update = useCallback(
    (value: MultiValue<SingleVal> | null) => {
      const strVal = value?.map((v) => v.value).join(',');
      setSelectorValue(value);
      setValue(strVal);
      setFieldValue('blacklistedTags', strVal);
    },
    [setSelectorValue, setValue, setFieldValue]
  );

  return (
    <>
      <ControlledKeywordSelector
        value={selectorValue}
        onChange={update}
        defaultValue={defaultValue}
        components={{
          DropdownIndicator: undefined,
          IndicatorSeparator: undefined,
          ClearIndicator: VerifyClearIndicator,
        }}
      />

      <BlacklistedTagsCopyButton value={value ?? ''} />
      <BlacklistedTagsImportButton setSelector={update} />
    </>
  );
};

type BaseSelectorMultiProps = {
  defaultValue?: string;
  value: MultiValue<SingleVal> | null;
  onChange: (value: MultiValue<SingleVal> | null) => void;
  components?: Partial<typeof components>;
};

const ControlledKeywordSelector = ({
  defaultValue,
  onChange,
  components,
  value,
}: BaseSelectorMultiProps) => {
  const intl = useIntl();

  useEffect(() => {
    const loadDefaultKeywords = async (): Promise<void> => {
      if (!defaultValue) {
        return;
      }

      const keywords = await Promise.all(
        defaultValue.split(',').map(async (keywordId) => {
          const res = await fetch(`/api/v1/keyword/${keywordId}`);
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          const keyword: Keyword = await res.json();

          return keyword;
        })
      );

      onChange(
        keywords.map((keyword) => ({
          label: keyword.name,
          value: keyword.id,
        }))
      );
    };

    loadDefaultKeywords();
  }, [defaultValue, onChange]);

  const loadKeywordOptions = async (inputValue: string) => {
    const res = await fetch(
      `/api/v1/search/keyword?query=${encodeURIExtraParams(inputValue)}`
    );
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    const results: TmdbKeywordSearchResponse = await res.json();

    return results.results.map((result) => ({
      label: result.name,
      value: result.id,
    }));
  };

  return (
    <AsyncSelect
      key={`keyword-select-blacklistedTags`}
      inputId="data"
      isMulti
      className="react-select-container"
      classNamePrefix="react-select"
      noOptionsMessage={({ inputValue }) =>
        inputValue === ''
          ? intl.formatMessage(messages.starttyping)
          : intl.formatMessage(messages.nooptions)
      }
      value={value}
      loadOptions={loadKeywordOptions}
      placeholder={intl.formatMessage(messages.searchKeywords)}
      onChange={onChange}
      components={components}
    />
  );
};

type BlacklistedTagsCopyButtonProps = {
  value: string;
};

const BlacklistedTagsCopyButton = ({
  value,
}: BlacklistedTagsCopyButtonProps) => {
  const intl = useIntl();
  const [isCopied, setCopied] = useClipboard(value, {
    successDuration: 1000,
  });
  const { addToast } = useToasts();

  useEffect(() => {
    if (isCopied) {
      addToast(intl.formatMessage(messages.copyBlacklistedTags), {
        appearance: 'info',
        autoDismiss: true,
      });
    }
  }, [isCopied, addToast, intl]);

  return (
    <Tooltip
      content={intl.formatMessage(messages.copyBlacklistedTagsTip)}
      tooltipConfig={{ followCursor: false }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          setCopied();
        }}
        className="input-action"
        type="button"
      >
        <ClipboardDocumentIcon />
      </button>
    </Tooltip>
  );
};

type BlacklistedTagsImportButton = {
  setSelector: (value: MultiValue<SingleVal>) => void;
};

const BlacklistedTagsImportButton = ({
  setSelector,
}: BlacklistedTagsImportButton) => {
  const [show, setShow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const intl = useIntl();

  const onConfirm = useCallback(async () => {
    if (formRef.current) {
      if (await formRef.current.submitForm()) {
        setShow(false);
      }
    }
  }, []);

  const onClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setShow(true);
  }, []);

  return (
    <>
      <Transition
        as="div"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={show}
      >
        <Modal
          title={intl.formatMessage(messages.blacklistedTagImportTitle)}
          okText="Confirm"
          onOk={onConfirm}
          onCancel={() => setShow(false)}
        >
          <BlacklistedTagImportForm ref={formRef} setSelector={setSelector} />
        </Modal>
      </Transition>

      <Tooltip
        content={intl.formatMessage(messages.importBlacklistedTagsTip)}
        tooltipConfig={{ followCursor: false }}
      >
        <button className="input-action" onClick={onClick} type="button">
          <ArrowDownIcon />
        </button>
      </Tooltip>
    </>
  );
};

type BlacklistedTagImportFormProps = BlacklistedTagsImportButton;

const BlacklistedTagImportForm = forwardRef<
  Partial<HTMLFormElement>,
  BlacklistedTagImportFormProps
>((props, ref) => {
  const { setSelector } = props;
  const intl = useIntl();
  const [formValue, setFormValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
    formValue,
  }));

  const validate = async () => {
    if (formValue.length === 0) {
      setErrors([intl.formatMessage(messages.valueRequired)]);
      return false;
    }

    if (!/^(?:\d+,)*\d+$/.test(formValue)) {
      setErrors([intl.formatMessage(messages.noSpecialCharacters)]);
      return false;
    }

    const keywords = await Promise.allSettled(
      formValue.split(',').map(async (keywordId) => {
        const res = await fetch(`/api/v1/keyword/${keywordId}`);
        if (!res.ok) {
          throw intl.formatMessage(messages.invalidKeyword, { keywordId });
        }

        const keyword: Keyword = await res.json();
        return {
          label: keyword.name,
          value: keyword.id,
        };
      })
    );

    const failures = keywords.filter(
      (res) => res.status === 'rejected'
    ) as PromiseRejectedResult[];
    if (failures.length > 0) {
      setErrors(failures.map((failure) => `${failure.reason}`));
      return false;
    }

    setSelector(
      (keywords as PromiseFulfilledResult<SingleVal>[]).map(
        (keyword) => keyword.value
      )
    );

    setErrors([]);
    return true;
  };

  const handleSubmit = validate;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="value">
          {intl.formatMessage(messages.blacklistedTagImportInstructions)}
        </label>
        <textarea
          id="value"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          className="h-20"
        />
        {errors.length > 0 && (
          <div className="error">
            {errors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
});

const VerifyClearIndicator = <
  Option,
  IsMuti extends boolean,
  Group extends GroupBase<Option>
>(
  props: ClearIndicatorProps<Option, IsMuti, Group>
) => {
  const { clearValue } = props;
  const [show, setShow] = useState(false);
  const intl = useIntl();

  const openForm = useCallback(() => {
    setShow(true);
  }, [setShow]);

  const openFormKey = useCallback(
    (event: React.KeyboardEvent) => {
      if (show) return;

      if (event.key === 'Enter' || event.key === 'Space') {
        setShow(true);
      }
    },
    [setShow, show]
  );

  const acceptForm = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.stopPropagation();
        event.preventDefault();
        clearValue();
      }
    },
    [clearValue]
  );

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', acceptForm);
    }

    return () => window.removeEventListener('keydown', acceptForm);
  }, [show, acceptForm]);

  return (
    <>
      <button
        type="button"
        onClick={openForm}
        onKeyDown={openFormKey}
        className="react-select__indicator react-select__clear-indicator css-1xc3v61-indicatorContainer cursor-pointer"
      >
        <components.CrossIcon />
      </button>
      <Transition
        as="div"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={show}
      >
        <Modal
          subTitle={intl.formatMessage(messages.clearBlacklistedTagsConfirm)}
          okText={intl.formatMessage(messages.yes)}
          cancelText={intl.formatMessage(messages.no)}
          onOk={clearValue}
          onCancel={() => setShow(false)}
        >
          <form />{' '}
          {/* Form prevents accidentally saving settings when pressing enter */}
        </Modal>
      </Transition>
    </>
  );
};

export default BlacklistedTagsSelector;
