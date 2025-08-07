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
      {..._box}
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#F5F5F5',
        borderRadius: '8px',
        boxShadow: '0px 1px 2px 0px #0000004D',
        ...(_box?.sx ?? {}),
      }}
    >
      <SearchIcon
        {..._icon}
        sx={{ color: '#757575', ml: 2, mr: 1, ...(_icon?.sx ?? {}) }}
      />
      <TextField
        variant="standard"
        placeholder="Search.."
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
      {!isHideSubmitButton && (
        <Button
          variant="contained"
          {..._button}
          sx={{
            bgcolor: '#FDBE16',
            color: '#1F1B13',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            boxShadow: 'none',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '16px',
            textTransform: 'none',
            '&:hover': { bgcolor: '#e9a416' },
            ...(_button?.sx ?? {}),
          }}
          onClick={(e) => onSearch(search, e)}
        >
          <SpeakableText>Search</SpeakableText>
        </Button>
      )}
    </Box>
  );
};
