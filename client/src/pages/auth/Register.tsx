import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { Helmet } from 'react-helmet-async';

const Register: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Register | Centre for Human Sciences | Rishihood University</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AuthForm />
    </>
  );
};

export default Register;
