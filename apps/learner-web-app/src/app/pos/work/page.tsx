import dynamic from 'next/dynamic';

const title = 'Learning for Work';
const description = `Learning for Work equips adolescents and youth with the skills and knowledge needed for employment and livelihoods`;

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: `/images/pos_work.jpg`,
        width: 800,
        height: 600,
      },
    ],
    type: 'website',
  },
};

const List = dynamic(() => import('@learner/components/pos/List'), {
  ssr: false,
});

export default function PosPage() {
  return (
    <List
      pagename="Work"
      _content={{ isOpenColapsed: ['se_subDomains', 'se_subjects'] }}
      _infoCard={{
        item: {
          description:
            'Learning for Work equips adolescents and youth with the skills and knowledge needed for employment and livelihoods',
        },
      }}
    />
  );
}
