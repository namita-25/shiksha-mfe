import { Box, MenuItem, Select, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from '@shared-lib';
import { TopicProp } from '@learner/components/Content/LTwoCourse';

interface StaticTopic {
  value: string;
  translationKey: string;
}

interface LevelUpProps {
  handleTopicChange: (event: TopicProp) => void;
  selectedTopic: string;
  topics?: TopicProp[];
}

const STATIC_TOPICS: StaticTopic[] = [
  { value: 'plumbing', translationKey: 'LEARNER_APP.LEVEL_UP.TOPIC_PLUMBING' },
  {
    value: 'electrical',
    translationKey: 'LEARNER_APP.LEVEL_UP.TOPIC_ELECTRICAL',
  },
  {
    value: 'carpentry',
    translationKey: 'LEARNER_APP.LEVEL_UP.TOPIC_CARPENTRY',
  },
  { value: 'masonry', translationKey: 'LEARNER_APP.LEVEL_UP.TOPIC_MASONRY' },
  { value: 'painting', translationKey: 'LEARNER_APP.LEVEL_UP.TOPIC_PAINTING' },
];

const LevelUp: React.FC<LevelUpProps> = React.memo(
  ({ handleTopicChange, selectedTopic, topics }) => {
    const { t } = useTranslation();

    const displayTopics = useMemo(() => {
      if (!topics?.length) {
        return [];
      }

      return topics.map((topic: any) => {
        const staticTopic = STATIC_TOPICS.find(
          (staticTopic) =>
            staticTopic.value.toLowerCase() === topic?.topic.toLowerCase()
        );

        return {
          ...topic,
          value: topic.topic,
          name: staticTopic ? t(staticTopic.translationKey) : topic?.topic,
        };
      });
    }, [topics, t]);

    return (
      <div>
        <Typography
          sx={{
            color: '#1F1B13',
            textAlign: 'center',
          }}
          variant="h1"
          mb={3}
          id="modal-title"
        >
          {t('LEARNER_APP.LEVEL_UP.TITLE')}
        </Typography>

        <Typography
          variant="h2"
          sx={{
            color: '#1F1B13',
            textAlign: 'center',
          }}
          mb={2}
        >
          {t('LEARNER_APP.LEVEL_UP.SUB_TITLE')}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Select
            value={selectedTopic}
            onChange={(e) =>
              handleTopicChange?.(
                displayTopics?.find((esub) => esub.value === e.target.value)
              )
            }
            displayEmpty
            fullWidth
            sx={{ textAlign: 'left' }}
          >
            <MenuItem disabled value="">
              <em>{t('LEARNER_APP.LEVEL_UP.TOPICS_PLACEHOLDER')}</em>
            </MenuItem>
            {displayTopics.map((topic) => (
              <MenuItem key={topic.value} value={topic.value}>
                {topic.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Typography variant="h4" color="#635E57" mb={3}>
          {t('LEARNER_APP.LEVEL_UP.FOOTER_TEXT')}
        </Typography>
      </div>
    );
  }
);

LevelUp.displayName = 'LevelUp';

export default LevelUp;
