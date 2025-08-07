import React from 'react';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SpeakableText from '@shared-lib-v2/lib/textToSpeech/SpeakableText';

interface SearchButtonProps {
  searchValue?: string;
  handleSearch?: (value: string) => void;
  onSearch: (searchValue: string, e?: any) => void;
  isHideSubmitButton?: boolean;
  _box?: any;
  _button?: any;
  _input?: any;
  _icon?: any;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  searchValue,
  handleSearch,
  onSearch,
  isHideSubmitButton,
  _box,
  _button,
  _input,
  _icon,
}) => {
  const [search, setSearch] = React.useState<string>(searchValue || '');

  React.useEffect(() => {
    setSearch(searchValue || '');
  }, [searchValue]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 500,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: '#fff',
          borderRadius: '8px',
          border: '1px solid #d3d3d3',
          boxShadow: 'none',
          px: 1.5,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          ...(_box?.sx ?? {}),
        }}
      >
        <TextField
          variant="standard"
          placeholder="Search"
          {..._input}
          InputProps={{
            disableUnderline: true,
            ...(_input?.InputProps ?? {}),
            sx: {
              fontFamily: 'Poppins',
              fontSize: '18px',
              pl: 1,
              bgcolor: 'transparent',
              ...(_input?.InputProps?.sx ?? {}),
            },
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleSearch?.(e.target.value);
          }}
          sx={{ flexGrow: 1, bgcolor: 'transparent', ...(_input?.sx ?? {}) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch(search, e);
            }
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        <SearchIcon
          {..._icon}
          sx={{
            color: '#212121',
            cursor: 'pointer',
            fontSize: 24,
            ...(_icon?.sx ?? {}),
          }}
          onClick={(e: any) => onSearch(search, e)}
        />
      </Box>
    </Box>
  );
};
