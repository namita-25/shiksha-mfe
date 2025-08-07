'use client';
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import SpeakableText from '../textToSpeech/SpeakableText';
import { capitalize } from 'lodash';
import { useTranslation } from '../context/LanguageContext';

type ExpandableTextProps = {
  text?: string;
  _text?: any;
  maxWords?: number;
  maxLines?: number;
};

export const ExpandableText: React.FC<ExpandableTextProps> = memo(
  ({ text = '', _text, maxWords = 60, maxLines = 2 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [truncatedText, setTruncatedText] = useState<string>('');
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation();

    // Function to truncate text by words
    const truncateByWords = useCallback(
      (text: string, maxWords: number): string => {
        const words = text.split(' ');
        if (words.length <= maxWords) {
          return text;
        }
        return words.slice(0, maxWords).join(' ');
      },
      []
    );

    // Check if text needs truncation
    useEffect(() => {
      if (text && textRef.current) {
        const words = text.split(' ');
        const needsWordTrunc = words.length > maxWords;

        // Create a temporary element to check if text overflows 2 lines
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.height = 'auto';
        tempElement.style.width = textRef.current.offsetWidth + 'px';
        tempElement.style.fontSize = window.getComputedStyle(
          textRef.current
        ).fontSize;
        tempElement.style.fontFamily = window.getComputedStyle(
          textRef.current
        ).fontFamily;
        tempElement.style.lineHeight = window.getComputedStyle(
          textRef.current
        ).lineHeight;
        tempElement.style.whiteSpace = 'pre-wrap';
        tempElement.innerHTML = text;

        document.body.appendChild(tempElement);
        const fullHeight = tempElement.scrollHeight;

        // Set line height to 2 lines to check overflow
        tempElement.style.height = `calc(2 * ${
          window.getComputedStyle(textRef.current).lineHeight
        })`;
        tempElement.style.overflow = 'hidden';
        const twoLineHeight = tempElement.scrollHeight;

        document.body.removeChild(tempElement);

        const needsLineTrunc = fullHeight > twoLineHeight;
        const needsTrunc = needsWordTrunc || needsLineTrunc;

        setNeedsTruncation(needsTrunc);

        if (needsTrunc) {
          setTruncatedText(truncateByWords(text, maxWords));
          setShowButton(true);
        } else {
          setTruncatedText(text);
          setShowButton(false);
        }
      }
    }, [text, maxWords, truncateByWords]);

    // Toggle expand/collapse
    const toggleExpand = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    // Determine which text to display
    const displayText = needsTruncation && !isExpanded ? truncatedText : text;

    return (
      <Box>
        <Typography
          ref={textRef}
          variant="body1"
          component="div"
          // {..._text}
          sx={{
            color: '#1F1B13',
            whiteSpace: 'pre-wrap',
            fontWeight: '400',
            // Use line-clamp when not expanded and truncation is needed
            ...(needsTruncation &&
              !isExpanded && {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }),
            // ..._text?.sx,
          }}
        >
          <SpeakableText>
            {displayText
              ? capitalize(displayText[0]) + displayText.slice(1)
              : ''}
          </SpeakableText>
        </Typography>

        {showButton && (
          <Button
            onClick={toggleExpand}
            sx={{
              textTransform: 'none',
              color: '#1F1B13',
              p: 0,
              minWidth: 'auto',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
              mt: 0.5,
              display: 'block',
              fontSize: 'inherit',
            }}
          >
            {isExpanded ? (
              <SpeakableText>{t('COMMON.READ_LESS')}</SpeakableText>
            ) : (
              <SpeakableText>{t('COMMON.READ_MORE')}</SpeakableText>
            )}
          </Button>
        )}
      </Box>
    );
  }
);
