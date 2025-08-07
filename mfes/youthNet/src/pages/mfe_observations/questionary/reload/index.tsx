import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const ReloadPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, [router]);

  return <h1>Reload</h1>;
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default ReloadPage;
