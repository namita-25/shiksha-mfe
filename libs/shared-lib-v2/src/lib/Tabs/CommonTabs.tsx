import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface TabItem {
  icon?: React.ReactElement;
  label: string;
  content?: React.ReactNode;
}

interface CommonTabsProps {
  tabs: TabItem[];
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  ariaLabel?: string;
}

export const CommonTabs: React.FC<CommonTabsProps> = ({
  tabs,
  value,
  onChange,
  ariaLabel = 'common tabs example',
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={onChange}
          aria-label={ariaLabel}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#6750A4',
              height: '3px',
              maxWidth: 49,
              width: '100%',
              marginLeft: '1.2rem',
            },
          }}
          sx={{
            '.MuiTab-root': {
              color: '#49454F', // Default tab text color
              fontWeight: 500,
              textTransform: 'none', // Ensures text remains camel case
            },
            '.Mui-selected': {
              color: '#6750A4 !important', // Selected tab text color
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.label}
              icon={tab.icon ?? undefined}
              label={tab.label}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <CustomTabPanel key={tab.label} value={value} index={index}>
          {tab.content}
        </CustomTabPanel>
      ))}
    </Box>
  );
};
