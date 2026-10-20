import LearningPathBuilderPage, { getStaticProps as builderStaticProps } from './builder';

export default LearningPathBuilderPage;

export const getStaticProps = builderStaticProps;

export const getStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'financial-inclusion-training-programme' } },
      { params: { id: 'new' } },
    ],
    fallback: 'blocking',
  };
};
