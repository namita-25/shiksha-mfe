'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface TextCardBlobProps {
  name: string;
  body?: string;          // HTML string
  subheading?: string;    // orange label below title
  description?: string;
  onComplete: () => void;
}

export const TextCardBlob: React.FC<TextCardBlobProps> = ({ name, body, subheading, description, onComplete }) => {
  const [processedHtml, setProcessedHtml] = useState<string>('');
  useEffect(() => {
    const t = setTimeout(() => onComplete(), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const htmlContent = body || description || '';
    if (typeof window !== 'undefined' && htmlContent) {
      try {
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        
        const walk = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue || '';
            if (urlRegex.test(text) && node.parentNode?.nodeName !== 'A') {
              const span = document.createElement('span');
              span.innerHTML = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #E6873C; text-decoration: underline;">${url}</a>`);
              node.parentNode?.replaceChild(span, node);
            }
          } else {
            Array.from(node.childNodes).forEach(walk);
          }
        };
        
        Array.from(doc.body.childNodes).forEach(walk);
        setProcessedHtml(doc.body.innerHTML);
      } catch (e) {
        setProcessedHtml(htmlContent);
      }
    } else {
      setProcessedHtml(htmlContent);
    }
  }, [body, description]);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        bgcolor: '#fff',
        mb: 2,
      }}
    >
      {/* Body */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1C2B4A', mb: subheading ? 0.5 : 1, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
          {name}
        </Typography>
        {subheading && (
          <Typography sx={{ fontSize: 12, color: '#E6873C', fontWeight: 700, mb: 1.5, fontFamily: 'Inter, sans-serif' }}>
            {subheading}
          </Typography>
        )}
        {processedHtml ? (
          <Box
            sx={{
              fontSize: 14,
              color: '#374151',
              lineHeight: 1.7,
              fontFamily: 'Inter, sans-serif',
              '& p': { mb: 1 },
              '& ul': { pl: 2, mb: 1 },
              '& strong': { fontWeight: 700 },
            }}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        ) : null}
      </Box>
    </Box>
  );
};
