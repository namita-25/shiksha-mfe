import HeaderWrapper from '@/components/layouts/header/HeaderWrapper';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

// const index = () => {
//   const mfe_workspace = process.env.NEXT_PUBLIC_WORKSPACE;
//   if (typeof window !== "undefined" && window.localStorage) {
//   localStorage.setItem("showHeader"  , "true")
//   }
//   console.log(mfe_workspace);

//   return (
//     <>
//     {/* <HeaderWrapper /> */}
//     {/* <div
//       style={{
//         padding: 0,
//         height: '100vh',
//         width: '100vw',
//         overflow: 'hidden',
//       }}
//     > */}

//       <iframe
//         src={mfe_workspace}
//         style={{
//           display: 'block',
//           // marginTop: 65,
//           padding: 0,
//           width: '100vw',
//           height: '100vh',
//           border: 'none',
//         }}
//         title="Embedded Localhost"
//       />
//     {/* </div> */}
//     </>
//   );
// };

// export async function getStaticProps({ locale }: any) {
//     return {
//       props: {
//         noLayout: true,
//         ...(await serverSideTranslations(locale, ["common"])),
//       },
//     };
//   }

// export default index;

import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();
  const path = process.env.NEXT_PUBLIC_WORKSPACE;
  useEffect(() => {
    router.push(path || '/'); // Replace with target page URL
  }, []);

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('showHeader', 'true');
  }
  return <div>Redirecting...</div>;
};

export default HomePage;
