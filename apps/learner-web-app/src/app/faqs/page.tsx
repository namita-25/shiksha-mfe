'use client'
import { useTheme } from '@mui/material/styles';
import React from 'react';
import Layout from '@learner/components/Layout';
import { useTranslation } from '@shared-lib';
import GoogleDocViewer from '@learner/components/GoogleDocViewer/GoogleDocViewer';

const FAQS = () => {


 
  return (
    <Layout>
<GoogleDocViewer
  getDocUrl={(lang: any) =>
    lang === 'english'
      ?        'https://docs.google.com/document/d/1GMnA5hF1MFsSOYn7WEJd2-4q6r41g9i4E3zbnQlY-0s/preview'
:'https://docs.google.com/document/d/1fDAlDHKujB9YcubdsDiYhaOUKJ3TV1CH-w5or_7Z3bk/preview'
  }
/>

    </Layout>
  );
};



export default FAQS;
