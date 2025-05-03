import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Helmet } from 'react-helmet-async';

const Register: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Register | CHC</title>
      </Helmet>
      <AuthForm />
    </>
  );
};

export default Register;
