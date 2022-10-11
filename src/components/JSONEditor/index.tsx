import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-dracula';
import type { HTMLAttributes } from 'react';
import AceEditor from 'react-ace';
interface JSONEditorProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  value: string;
  onUpdate: (value: string) => void;
}

const JSONEditor = ({ name, value, onUpdate, onBlur }: JSONEditorProps) => {
  return (
    <div className="w-full overflow-hidden rounded-md">
      <AceEditor
        mode="json"
        theme="dracula"
        onChange={onUpdate}
        name={name}
        editorProps={{ $blockScrolling: true }}
        value={value}
        onBlur={onBlur}
        height="300px"
        width="100%"
      />
    </div>
  );
};

export default JSONEditor;
