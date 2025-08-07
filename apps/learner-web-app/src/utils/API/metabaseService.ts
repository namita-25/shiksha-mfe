import { fetchContent, hierarchyAPI } from './contentService';

export async function getMetadata(identifier: any, unitId?: any) {
  let product = { name: '', description: '', appIcon: '', posterImage: '' };
  if (unitId) {
    product = await hierarchyAPI(unitId);
  } else {
    product = await fetchContent(identifier);
  }
  return {
    title: product?.name,
    description: product?.description,
    openGraph: {
      title: product?.name,
      description: product?.description,
      images: [
        {
          url:
            product?.posterImage || product?.appIcon || '/images/image_ver.png',
          width: 1200,
          height: 630,
          alt: product?.name,
        },
      ],
    },
  };
}
