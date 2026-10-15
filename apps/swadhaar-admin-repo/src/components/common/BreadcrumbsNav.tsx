import React from 'react';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import Link from 'next/link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsNavProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbsNav: React.FC<BreadcrumbsNavProps> = ({ items }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
        aria-label="breadcrumb"
      >
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', color: '#6B7280' }}>
          <HomeOutlinedIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
            Home
          </Typography>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return isLast || !item.href ? (
            <Typography key={item.label} variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {item.label}
            </Typography>
          ) : (
            <Link key={item.label} href={item.href} style={{ color: '#6B7280' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsNav;
