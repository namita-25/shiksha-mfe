export { default, getStaticProps } from './builder';

export const getStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'financial-inclusion-training-programme' } },
      { params: { id: 'new' } },
    ],
    fallback: 'blocking',
  };
};
