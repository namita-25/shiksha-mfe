import GoogleDocViewer from '@/components/GoogleDocViewer/GoogleDocViewer';
import Header from '@/components/Header';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

const FAQS = () => {
  

 
  return (
    <>
      <Header />
      <GoogleDocViewer
  getDocUrl={(lang: any) =>
    lang === 'english'
      ?        'https://docs.google.com/document/d/1GMnA5hF1MFsSOYn7WEJd2-4q6r41g9i4E3zbnQlY-0s/preview'
:'https://docs.google.com/document/d/1fDAlDHKujB9YcubdsDiYhaOUKJ3TV1CH-w5or_7Z3bk/preview'
  }
/>

    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default FAQS;
