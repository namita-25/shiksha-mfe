import dynamic from 'next/dynamic';

export function generateMetadata({
  searchParams: { program },
}: {
  searchParams: { program: string };
}) {
  const titles = {
    SCP: 'Second Chance Program',
    'Vocational Training': 'Vocational Training',
  };

  const descriptions = {
    SCP: `The Second Chance Program by Pratham is a powerful initiative that helps young girls and women who dropped out of school complete their Grade 10 education. By bringing learning closer to home and offering the support they need, the program breaks barriers like early marriage, household responsibilities, and lack of access. It opens doors to higher education, skills training, and better job opportunities, giving women a real shot at a brighter future.`,
    'Vocational Training': `Pratham’s Vocational Skilling Program, launched in 2005, empowers youth from underprivileged backgrounds by equipping them with practical, job-ready skills. With a presence across India, it opens doors to employment in over 10 key sectors, supported by affiliations like NSDC. In response to changing times, the program evolved into a Hybrid Skilling model, blending digital tools with training to help young people thrive in a post-pandemic world.`,
  };

  const title =
    (titles as Record<string, string>)[program] || 'Learning for Life';
  const description =
    (descriptions as Record<string, string>)[program] ||
    `Learning for Life encompasses skills and knowledge that are a part of lifelong learning like transferable skills, interests, hobbies, and creativity. These also include life skills but are not limited to them.  It emphasises environmental awareness, physical and mental well-being, and extends learning beyond scholastic subjects.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/images/pos_program.jpg`,
          width: 800,
          height: 600,
        },
      ],
      type: 'website',
    },
  };
}

const List = dynamic(() => import('@learner/components/pos/List'), {
  ssr: false,
});

export default function PosPage() {
  return (
    <List
      pagename={{
        SCP: 'second chance program',
        'Vocational Training': 'YouthNet',
      }}
      _content={{
        contentTabs: ['content'],
        isOpenColapsed: ['se_domains', 'se_subDomains', 'se_subjects'],
      }}
      _infoCard={{
        item: {
          description: {
            SCP: 'The Second Chance Program by Pratham is a powerful initiative that helps young girls and women who dropped out of school complete their Grade 10 education. By bringing learning closer to home and offering the support they need, the program breaks barriers like early marriage, household responsibilities, and lack of access. It opens doors to higher education, skills training, and better job opportunities, giving women a real shot at a brighter future.',
            'Vocational Training':
              'Pratham’s Vocational Skilling Program, launched in 2005, empowers youth from underprivileged backgrounds by equipping them with practical, job-ready skills. With a presence across India, it opens doors to employment in over 10 key sectors, supported by affiliations like NSDC. In response to changing times, the program evolved into a Hybrid Skilling model, blending digital tools with training to help young people thrive in a post-pandemic world.',
          },
        },
      }}
    />
  );
}
