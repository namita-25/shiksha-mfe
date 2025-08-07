import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Link,
  Box,
  Grid,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getContentHierarchy } from '@workspace/services/ContentService';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import ResourceCard from '@workspace/components/ResourceCard';
import Layout from "@workspace/components/Layout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RecursiveAccordion = ({ data }: { data: any[] }) => {
  const router = useRouter();
  const renderAccordion = (nodes: any[], level = 0) => {
    const resourceNodes = nodes.filter(node => node.mimeType !== 'application/vnd.ekstep.content-collection');
    const nonResourceNodes = nodes.filter(node => node.mimeType === 'application/vnd.ekstep.content-collection');

    return (
      <>
        {resourceNodes.length > 0 && (
          <Grid container spacing={2} sx={{ marginBottom: '16px' }}>
            {resourceNodes.map((node, index) => (
              <Grid item xs={6} md={4} lg={3} key={`${node.name}-${index}`}>
                <ResourceCard
                  title={node?.name}
                  resource={node?.resourceType}
                  identifier={node?.identifier}
                  mimeType={node?.mimeType}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {nonResourceNodes.map((node, index) => (
          <Box key={`${node.name}-${index}`} sx={{ marginBottom: '16px' }}>
            {level === 0 ? (
              <>
                <Typography
                  variant="h1"
                  sx={{
                    marginBottom: '0.75rem',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ddd',
                    paddingLeft: '4px',
                    padding:'16px'
                  }}
                >
                  {node.name}
                </Typography>
                {node.children && renderAccordion(node.children, level + 1)}
              </>
            ) : (
                <Accordion sx={{
                  marginLeft: `${(level - 1) * 0.2}px`,
                  boxShadow:
                    level !== 1
                      ? '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
                      : 'unset',
                }}>
                  <AccordionSummary sx={{
                    '&.MuiAccordionSummary-root': {
                      backgroundColor: level === 1 ? '#F1E7D9' : '#fff',
                      borderBottom: '1px solid #D0C5B4',
                    },
                  }} expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1"
                      fontWeight={500}
                      sx={{ color: '#1F1B13', fontWeight: 500, fontSize: '14px' }}>
                    {node?.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{padding:'20px'}}>
                  {node?.children && renderAccordion(node?.children, level + 1)}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        ))}
      </>
    );
  };

  return <Box>{renderAccordion(data)}</Box>;
};


export default function CourseHierarchy() {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState("");
  const [doId, setDoId] = useState<string | null>(null);
  const [courseHierarchyData, setCourseHierarchyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [contentMode, setContentMode] = useState<string>("");
  useEffect(() => {
    if (router.query.identifier) {
      setDoId(router.query.identifier as string);
    }
    if (router.query.isReadOnly) {
      setContentMode("edit")
    }
    if (router.query.previousPage) {
      setSelectedKey(router.query.previousPage as string)
    }
  }, [router.query.identifier, router.query.previousPage]);

  useEffect(() => {
    const fetchCohortHierarchy = async (doId: string): Promise<any> => {
      try {
        const hierarchyResponse = await getContentHierarchy({
          doId, contentMode
        });
        setLoading(true);
        const hierarchyData = hierarchyResponse?.data?.result?.content;
        setCourseHierarchyData([hierarchyData]);

        return hierarchyResponse;
      } catch (error) {
        console.error('Error fetching solution details:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    if (typeof doId === 'string') {
      fetchCohortHierarchy(doId);
    }
  }, [doId]);

  if (loading) {
    return (
      <Loader showBackdrop={true} loadingText="Loading" />
    );
  }

  return (
    <Layout selectedKey={selectedKey} onSelect={setSelectedKey}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}
      onClick={() => router.back()}>
        <IconButton>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{"Back"}</Typography>
      </Box>
      <RecursiveAccordion data={courseHierarchyData} />
    </Layout>
  );
}