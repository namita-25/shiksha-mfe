import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import HubIcon from '@mui/icons-material/Hub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';
import { SWADHAAR_CHANNEL_ID, SWADHAAR_FRAMEWORK } from '@/utils/app.constant';
import SwadhaarStatCard from '@/components/common/SwadhaarStatCard';
import LifecycleChip from '@/components/common/LifecycleChip';
import SDBVHierarchyFilter, { SDBVFilterValues } from '@/components/common/SDBVHierarchyFilter';
import SwadhaarDataTable, { ColumnDef } from '@/components/common/SwadhaarDataTable';
import BreadcrumbsNav from '@/components/common/BreadcrumbsNav';

interface CohortRecord {
  id: string;
  name: string;
  branch: string;
  members: number;
  progress: number;
  status: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('Administrator');
  const [filters, setFilters] = useState<SDBVFilterValues>({
    state: '',
    district: '',
    block: '',
    village: '',
    program: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminInfo');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserName(parsed?.name || parsed?.username || 'Administrator');
        } catch {
          // fallback
        }
      }
    }
  }, []);

  const stats = [
    {
      label: 'Active Users',
      value: '1,420',
      change: '+12% this month',
      trend: 'up' as const,
      icon: <GroupIcon sx={{ color: 'primary.main', fontSize: 26 }} />,
      bg: 'primary.100',
    },
    {
      label: 'Active Cohorts',
      value: '38',
      change: 'Covering 6 regions',
      trend: 'neutral' as const,
      icon: <HubIcon sx={{ color: 'secondary.main', fontSize: 26 }} />,
      bg: 'secondary.100',
    },
    {
      label: 'Published Courses',
      value: '14',
      change: 'Across Levels 1-3',
      trend: 'up' as const,
      icon: <MenuBookIcon sx={{ color: 'success.main', fontSize: 26 }} />,
      bg: 'success.light',
    },
    {
      label: 'Course Completion Rate',
      value: '78.4%',
      change: 'Above target (75%)',
      trend: 'up' as const,
      icon: <CheckCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 26 }} />,
      bg: 'primary.100',
    },
  ];

  const recentCohorts: CohortRecord[] = [
    {
      id: 'COH-101',
      name: 'Financial Inclusion - Batch 14',
      branch: 'Pune Central CFL',
      members: 32,
      progress: 85,
      status: 'Active',
    },
    {
      id: 'COH-102',
      name: 'Micro-Enterprise Skillset',
      branch: 'Nagpur East',
      members: 28,
      progress: 60,
      status: 'Active',
    },
    {
      id: 'COH-103',
      name: 'Digital Banking Basics',
      branch: 'Nashik Urban',
      members: 40,
      progress: 92,
      status: 'Published',
    },
    {
      id: 'COH-104',
      name: 'Household Budgeting & Savings',
      branch: 'Solapur Hub',
      members: 25,
      progress: 40,
      status: 'Draft',
    },
  ];

  const cohortColumns: ColumnDef<CohortRecord>[] = [
    {
      id: 'name',
      label: 'Cohort Name',
      minWidth: 220,
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {row.name}
        </Typography>
      ),
    },
    {
      id: 'branch',
      label: 'Branch / Center',
      minWidth: 160,
      sortable: true,
    },
    {
      id: 'members',
      label: 'Members',
      minWidth: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'progress',
      label: 'Progress',
      minWidth: 150,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={row.progress}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'secondary.300',
              '& .MuiLinearProgress-bar': {
                backgroundColor: row.progress >= 80 ? 'success.main' : 'primary.main',
              },
            }}
          />
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', minWidth: 28 }}>
            {row.progress}%
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Lifecycle State',
      minWidth: 140,
      render: (row) => <LifecycleChip state={row.status} />,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Breadcrumb Navigation */}
      <BreadcrumbsNav items={[{ label: 'Dashboard' }]} />

      {/* Welcome Banner */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: 'secondary.main',
          color: 'secondary.contrastText',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(28, 43, 74, 0.15)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 0.8, color: '#FFFFFF' }}>
                Welcome back, {userName}!
              </Typography>
              <Typography variant="body1" sx={{ color: '#D1D5DB', maxWidth: 650 }}>
                Swadhaar FinAccess operations portal. Monitor user onboarding, track cohort progression through training courses, and review learning analytics.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`Channel: ${SWADHAAR_CHANNEL_ID}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(230, 135, 60, 0.2)',
                  color: '#FFA05C',
                  border: '1px solid rgba(230, 135, 60, 0.5)',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              />
              <Chip
                label={`Framework: ${SWADHAAR_FRAMEWORK}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: '11px',
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* SDBV Cascading Filter Bar */}
      <SDBVHierarchyFilter values={filters} onChange={setFilters} />

      {/* KPI Stat Cards (SwadhaarStatCard Primitive) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={`kpi-${idx}`}>
            <SwadhaarStatCard
              label={item.label}
              value={item.value}
              change={item.change}
              trend={item.trend}
              icon={item.icon}
              bg={item.bg}
            />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid: Cohorts Table & Quick Operations */}
      <Grid container spacing={3}>
        {/* Active Cohorts using SwadhaarDataTable Primitive */}
        <Grid item xs={12} lg={8}>
          <SwadhaarDataTable<CohortRecord>
            columns={cohortColumns}
            data={recentCohorts}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search active cohorts..."
            actionsToolbar={
              <Link href="/cohorts" style={{ textDecoration: 'none' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontWeight: 600, fontSize: '12px' }}
                >
                  View All Cohorts
                </Button>
              </Link>
            }
          />
        </Grid>

        {/* Quick Operations Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h3" sx={{ color: 'secondary.main', mb: 2 }}>
                Quick Operations
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Link href="/users" style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.100',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <GroupIcon sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Manage Users
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Roster, SDBV filters & roles
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                </Link>

                <Link href="/cohorts" style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.100',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <HubIcon sx={{ color: 'secondary.main' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Cohorts & Groups
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Two-panel builder & in-group roles
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                </Link>

                <Link href="/content/courses" style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.100',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MenuBookIcon sx={{ color: 'success.main' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Courses & Content
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Authoring, media & assessments
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                </Link>

                <Link href="/reports" style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.100',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AssessmentIcon sx={{ color: 'info.main' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Analytics & Reports
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Operational metrics & export
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'], nextI18NextConfig as any)),
    },
  };
}
