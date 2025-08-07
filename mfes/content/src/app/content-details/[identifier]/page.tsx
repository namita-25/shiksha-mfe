'use client';
import ContentEnroll from '@content-mfes/components/Content/ContentEnroll';
import LayoutPage from '@content-mfes/components/LayoutPage';

const ContentDetailsPage = () => {
  return (
    <LayoutPage isShow={false}>
      <ContentEnroll
        isShowLayout={false}
        _config={{
          default_img: '/images/image_ver.png',
          _infoCard: { _cardMedia: { maxHeight: '280px' } },
        }}
      />
    </LayoutPage>
  );
};

export default ContentDetailsPage;
