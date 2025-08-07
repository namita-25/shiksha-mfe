import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FilterForm } from '@shared-lib-v2/lib/Filter/FilterForm';
import { getContentPDF } from '../../services/ContentService';
import KaTableComponent from '../KaTableComponent';
import { DataType } from 'ka-table/enums';
import useTenantConfig from '../../hooks/useTenantConfig';

const poppinsFont = {
  fontFamily: 'Poppins',
};

interface SelectContentProps {
  formState: any;
  selected: string[];
  setSelected: (ids: string[]) => void;
  staticFilter: any;
  onlyFields?: any;
  inputType?: any;
  onNext: (filter: any) => void;
}

const columns = [
  {
    key: 'title_and_description',
    title: 'TITLE & DESCRIPTION',
    dataType: DataType.String,
    width: '350px',
  },
  {
    key: 'create-by',
    title: 'CREATED BY',
    dataType: DataType.String,
    width: '100px',
  },
  // {
  //   key: 'contentType',
  //   title: 'CONTENT TYPE',
  //   dataType: DataType.String,
  //   width: '100px',
  // },
  // {
  //   key: 'language',
  //   title: 'Content Language',
  //   dataType: DataType.String,
  //   width: '200px',
  // },
  // { key: 'state', title: 'STATE', dataType: DataType.String, width: '100px' },
  { key: 'status', title: 'STATUS', dataType: DataType.String, width: '100px' },
  {
    key: 'lastUpdatedOn',
    title: 'LAST MODIFIED',
    dataType: DataType.String,
    width: '100px',
  },
];

const SelectContent: React.FC<SelectContentProps> = ({
  formState,
  selected,
  setSelected,
  staticFilter,
  onlyFields,
  inputType,
  onNext,
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [contentSources, setContentSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 5;
  const [hasMore, setHasMore] = useState(true);
  const tenantConfig = useTenantConfig();
  // Local filter state
  const [filter, setFilter] = useState<any>({});

  React.useEffect(() => {
    setFilter({ ...formState, ...staticFilter });
  }, [formState, staticFilter]);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Handler for FilterForm changes
  const handleFilterChange = (newFilter: any) => {
    setFilter(newFilter);
    setPage(0);
    setHasMore(true);
  };

  // Fetch content sources
  React.useEffect(() => {
    const fetchContentSources = async () => {
      setLoading(true);
      try {
        const status = ['Live'];
        const query = debouncedSearch || '';
        const offset = page * LIMIT;
        // Always use Learning Resource and PDF
        const primaryCategory = ['Learning Resource'];
        const sort_by = { lastUpdatedOn: 'desc' };
        const channel = tenantConfig?.CHANNEL_ID;
        // const contentType = 'discover-contents';
        if (!channel) return;
        // API call
        const response = await getContentPDF({
          query,
          limit: LIMIT,
          offset,
          sort_by,
          filters: {
            ...filter, // existing filter object if any
            status,
            primaryCategory,
            channel,
            // contentType,
            mimeType: 'application/pdf',
            // 'mimeType' will be added inside the function, no need to pass here
          },
        });
        // No need to filter for PDF mimeType here, API already does it
        const contentList = (response?.content || []).concat(
          response?.QuestionSet || []
        );
        if (page === 0) {
          setContentSources(contentList);
        } else {
          setContentSources((prev) => [...prev, ...contentList]);
        }
        setHasMore(contentList.length === LIMIT);
      } catch (error) {
        setContentSources([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchContentSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filter, page, tenantConfig]);

  // Scroll to bottom on load more using MutationObserver
  useEffect(() => {
    if (page > 0) {
      const tableContainer = document.querySelector('.ka-table-wrapper');
      if (!tableContainer) return;
      const observer = new MutationObserver(() => {
        tableContainer.scrollTo({
          top: tableContainer.scrollHeight,
          behavior: 'smooth',
        });
        observer.disconnect(); // Only scroll once per update
      });
      observer.observe(tableContainer, { childList: true, subtree: true });
      // Cleanup
      return () => observer.disconnect();
    }
  }, [contentSources, page]);

  // Selection logic for KaTableComponent
  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  // Remove selected content from chip
  const handleRemoveChip = (id: string) => {
    setSelected(selected.filter((sid) => sid !== id));
  };

  const filteredSources = contentSources.filter((item) =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <Box>
      <Box p={3} pb={0}>
        {tenantConfig?.COLLECTION_FRAMEWORK && (
          <FilterForm
            orginalFormData={filter}
            // isShowStaticFilterValue={true}
            onlyFields={onlyFields}
            staticFilter={staticFilter}
            _config={{
              COLLECTION_FRAMEWORK:
                tenantConfig?.COLLECTION_FRAMEWORK === 'scp-framework'
                  ? 'pos-framework'
                  : tenantConfig?.COLLECTION_FRAMEWORK,
              CHANNEL_ID:
                tenantConfig?.CHANNEL_ID === 'scp-channel'
                  ? 'pos-channel'
                  : tenantConfig?.CHANNEL_ID,
              _loader: { _loader: { minHeight: 300 } },
              _box: { sx: { flexDirection: 'row', flexWrap: 'wrap' } },
              _selectOptionBox: { sx: { minWidth: 300, maxWidth: 300 } },
              inputType: inputType,
            }}
            onApply={handleFilterChange}
          />
        )}
        <Box sx={{ my: 2, width: 400 }}>
          <TextField
            fullWidth
            size="medium"
            placeholder="Search content.."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
              setHasMore(true);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { bgcolor: '#F0F0F0', borderRadius: 1 },
            }}
          />
        </Box>
        <Typography
          sx={{
            ...poppinsFont,
            fontWeight: 400,
            fontSize: 16,
            color: '#7C766F',
            mb: 2,
          }}
        >
          Select up to 3 content sources for your questions
        </Typography>
        {/* Selected content chips */}
        {selected.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selected.map((id) => {
              const item = contentSources.find((c) => c.identifier === id);
              return (
                <Chip
                  key={id}
                  label={item ? item.name : id}
                  onDelete={() => handleRemoveChip(id)}
                  color="primary"
                  sx={{
                    fontWeight: 500,
                    color: '#1E1B16',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(30, 27, 22, 0.7)', // delete button color
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>

      <KaTableComponent
        columns={columns}
        tableTitle="discover-contents"
        data={filteredSources}
        selectable
        selected={selected}
        onSelect={handleSelect}
      />
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      {!loading && hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setPage((prev) => prev + 1)}
          >
            Load More
          </Button>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
        <Button
          variant="contained"
          sx={{
            borderRadius: 100,
            px: 4,
            py: 1,
            fontWeight: 500,
            bgcolor: '#FDBE16',
            color: '#1E1B16',
            ...poppinsFont,
          }}
          disabled={selected.length === 0}
          onClick={() => {
            // Prepare array of {id, pdfUrl} for onNext
            const selectedArr = selected.map((id) => {
              const item = contentSources.find((c) => c.identifier === id);
              return { id, url: item?.downloadUrl || '' };
            });
            onNext({ content: selectedArr, ...filter });
          }}
        >
          Next: Set Parameters
        </Button>
      </Box>
    </Box>
  );
};

export default SelectContent;
