import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Helmet } from 'react-helmet';

const Login: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Login | BlogCMS</title>
      </Helmet>
      <AuthForm />
    </>
  );
};

export default Login;
