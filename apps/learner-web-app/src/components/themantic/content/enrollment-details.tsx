'use client';
import ContentEnroll from '@content-mfes/components/Content/ContentEnroll';
import LayoutPage from '@content-mfes/components/LayoutPage';
import SubHeader from '../subHeader/SubHeader';

const ContentDetailsPage = () => {
  return (
    <LayoutPage isShow={false}>
      <SubHeader showFilter={false} />
      <ContentEnroll
        isShowLayout={false}
        _config={{
          contentBaseUrl: '/themantic',
          isEnrollmentRequired: false,
          default_img: '/images/image_ver.png',
          _infoCard: { _cardMedia: { maxHeight: '280px' } },
        }}
      />
    </LayoutPage>
  );
};

export default ContentDetailsPage;
