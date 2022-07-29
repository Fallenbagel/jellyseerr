import React from 'react';
import Alert from '../Common/Alert';
import Transition from '../Transition';

interface LoginErrorProps {
  error: string;
}

const LoginError: React.FC<LoginErrorProps> = ({ error }) => {
  return (
    <Transition
      show={!!error}
      enter="opacity-0 transition duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="opacity-100 transition duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Alert type="error">{error}</Alert>
    </Transition>
  );
};

export default LoginError;
