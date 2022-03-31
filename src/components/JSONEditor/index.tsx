import React, { HTMLAttributes } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-dracula';

interface JSONEditorProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  value: string;
  onUpdate: (value: string) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({
  name,
  value,
  onUpdate,
  onBlur,
}) => {
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
