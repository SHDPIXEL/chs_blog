import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Helmet } from 'react-helmet-async';

const Login: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Login | CHC</title>
      </Helmet>
      <AuthForm />
    </>
  );
};

export default Login;
