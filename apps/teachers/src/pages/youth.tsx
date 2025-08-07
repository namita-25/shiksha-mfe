import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { TENANT_DATA } from '../utils/app.config';
import withRole from '../utils/hoc/withRole';
import { GetServerSideProps } from 'next';
// const youth = () => {
//   const mfe_youthnet = process.env.NEXT_PUBLIC_YOUTHNET_PROJECT;
//   return (
//     <div
//       style={{
//         padding: 0,
//         height: '100vh',
//         width: '100vw',
//         overflow: 'hidden',
//       }}
//     >
//       <iframe
//         src={mfe_youthnet}
//         style={{
//           display: 'block', // Ensures no extra space around the iframe
//           margin: 0,
//           padding: 0,
//           width: '100vw',
//           height: '100vh',
//           border: 'none',
//         }}
//         title="Embedded Localhost"
//       />
//     </div>
//   );
// };

//export default withRole(TENANT_DATA.YOUTHNET)(youth);

import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();
const path=process.env.NEXT_PUBLIC_YOUTHNET_PROJECT
  useEffect(() => {
    router.push(path || "/"); // Replace with target page URL
  }, []);

  return <div>Redirecting...</div>;
};

export default HomePage;
