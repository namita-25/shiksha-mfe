import React, { useState } from 'react';
import { Table as KaTable } from 'ka-table';
import { DataType, EditingMode, SortingMode } from 'ka-table/enums';
import {
  Typography,
  useTheme,
  IconButton,
  Box,
  Grid,
  Tooltip,
} from '@mui/material';
import UpReviewTinyImage from '@mui/icons-material/LibraryBooks';
import 'ka-table/style.css';
import DeleteIcon from '@mui/icons-material/Delete';
import router from 'next/router';
import { MIME_TYPE } from '../utils/app.config';
import Image from 'next/image';
import ActionIcon from './ActionIcon';
import { Padding } from '@mui/icons-material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrModal from './QrModal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Checkbox from '@mui/material/Checkbox';

interface CustomTableProps {
  data: any[]; // Define a more specific type for your data if needed
  columns: Array<{
    key: string;
    title: string;
    dataType: DataType;
  }>;
  handleDelete?: any;
  tableTitle?: string;
  showQrCodeButton?: boolean;
  selectable?: boolean;
  selected?: string[];
  onSelect?: (id: string) => void;
}

const KaTableComponent: React.FC<CustomTableProps> = ({
  data,
  columns,
  tableTitle,
  showQrCodeButton = false,
  selectable = false,
  selected = [],
  onSelect,
}) => {
  const theme = useTheme<any>();
  const [open, setOpen] = useState(false);
  const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
  const [selectedQrValue, setSelectedQrValue] = useState<string>('');

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => setOpen(true);
  const handleOpenQrModal = (qrValue: string) => {
    setSelectedQrValue(qrValue);
    setOpenQrCodeModal(true);
  };

  const openEditor = (content: any) => {
    console.log('content', content);
    const identifier = content?.identifier;
    let mode = content?.mode; // default mode from content, can be overwritten by tableTitle

    switch (tableTitle) {
      case 'draft':
        mode = !mode ? 'edit' : mode;
        localStorage.setItem('contentMode', mode);

        // Use draft-specific routing
        if (content?.mimeType === MIME_TYPE.QUESTIONSET_MIME_TYPE) {
          router.push({ pathname: `/editor`, query: { identifier } });
        } else if (
          content?.mimeType &&
          MIME_TYPE.GENERIC_MIME_TYPE.includes(content?.mimeType)
        ) {
          sessionStorage.setItem('previousPage', window.location.href);
          router.push({ pathname: `/upload-editor`, query: { identifier } });
        } else if (
          content?.mimeType &&
          MIME_TYPE.COLLECTION_MIME_TYPE.includes(content?.mimeType)
        ) {
          router.push({ pathname: `/collection`, query: { identifier } });
        }
        return; // Exit early since draft has specific routing logic

      case 'publish':
      case 'discover-contents':
      case 'submitted':
        mode = 'read';
        break;

      case 'upForReview':
        mode = 'review';
        break;

      case 'all-content':
        mode =
          content?.status === 'Draft' || content?.status === 'Live'
            ? 'edit'
            : 'review';
        break;

      default:
        mode = mode || 'read';
        break;
    }

    // Save mode in localStorage
    localStorage.setItem('contentMode', mode);

    // Generic routing for cases other than 'draft'
    if (content?.mimeType === MIME_TYPE.QUESTIONSET_MIME_TYPE) {
      router.push({ pathname: `/editor`, query: { identifier } });
    } else if (tableTitle === 'submitted') {
      content.contentType === 'Course'
        ? router.push({
            pathname: `/course-hierarchy/${identifier}`,
            query: { identifier, isReadOnly: true, previousPage: 'submitted' },
          })
        : router.push({
            pathname: `/workspace/content/review`,
            query: { identifier },
          });
    } else if (tableTitle === 'all-content' && mode === 'review') {
      content.contentType === 'Course'
        ? router.push({
            pathname: `/course-hierarchy/${identifier}`,
            query: {
              identifier,
              isReadOnly: true,
              previousPage: 'allContents',
            },
          })
        : router.push({
            pathname: `/workspace/content/review`,
            query: { identifier, isReadOnly: true },
          });
    } else if (tableTitle === 'discover-contents') {
      content.contentType === 'Course'
        ? router.push({
            pathname: `/course-hierarchy/${identifier}`,
            query: { identifier, previousPage: 'discover-contents' },
          })
        : router.push({
            pathname: `/workspace/content/review`,
            query: { identifier, isDiscoverContent: true },
          });
    } else if (
      content?.mimeType &&
      MIME_TYPE.GENERIC_MIME_TYPE.includes(content?.mimeType)
    ) {
      localStorage.setItem('contentCreatedBy', content?.createdBy);
      console.log(content);
      const pathname =
        tableTitle === 'upForReview'
          ? `/workspace/content/review`
          : `/upload-editor`;
      router.push({ pathname, query: { identifier } });
    } else if (
      content?.mimeType &&
      MIME_TYPE.COLLECTION_MIME_TYPE.includes(content?.mimeType)
    ) {
      router.push({ pathname: `/collection`, query: { identifier } });
    }
  };

  return (
    <>
      <KaTable
        columns={
          selectable
            ? [
                {
                  key: '__select__',
                  title: '',
                  dataType: DataType.Boolean,
                  style: { width: 40 },
                },
                ...columns,
              ]
            : columns
        }
        data={data}
        rowKeyField={'identifier'}
        sortingMode={SortingMode.Single}
        childComponents={{
          cell: selectable
            ? {
                content: (props) => {
                  if (props.column.key === '__select__') {
                    return (
                      <Checkbox
                        checked={selected.includes(props.rowData.identifier)}
                        disabled={
                          !selected.includes(props.rowData.identifier) &&
                          selected.length >= 3
                        }
                        onChange={() =>
                          onSelect && onSelect(props.rowData.identifier)
                        }
                        size="small"
                      />
                    );
                  }
                  return undefined;
                },
              }
            : undefined,
          cellText: {
            content: (props) => {
              if (
                props.column.key === 'name' ||
                props.column.key === 'title_and_description'
              ) {
                return (
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {props.rowData.name}
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: selectable ? 'default' : 'pointer',
                      }}
                      onClick={() => !selectable && openEditor(props.rowData)}
                    >
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item xs={3} md={3} lg={3} xl={2}>
                          {props.rowData.image ? (
                            <Box
                              style={{
                                width: '60px',
                                height: '40px',
                                padding: '10px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={props.rowData.image || '/logo.png'}
                                alt="Image"
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto%',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              style={{
                                width: '60px',
                                height: '40px',
                                padding: '10px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={'/logo.png'}
                                height="25px"
                                alt="Image"
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto%',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                }}
                              />
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={9} md={9} lg={9} xl={10}>
                          <div>
                            <div>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  color: '#1F1B13',
                                  fontSize: '14px',
                                }}
                                className="one-line-text"
                              >
                                {props.rowData.name}
                              </Typography>
                            </div>
                            <div>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 400,
                                  color: '#635E57',
                                  fontSize: '12px',
                                }}
                                className="two-line-text"
                                color={theme.palette.warning['A200']}
                              >
                                {props.column.key === 'name'
                                  ? props.rowData.primaryCategory
                                  : props.rowData.description}
                              </Typography>
                            </div>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </Tooltip>
                );
              } else if (props.column.key === 'status') {
                if (props.rowData.status === 'Draft') {
                  return (
                    <Typography
                      sx={{ fontSize: '14px', fontWeight: 500 }}
                      variant="body2"
                      className="one-line-text"
                      color={'#987100'}
                    >
                      {props.rowData.status}
                    </Typography>
                  );
                }
                if (props.rowData.status === 'Review') {
                  return (
                    <Typography
                      className="one-line-text"
                      sx={{ fontSize: '14px', fontWeight: 500 }}
                      variant="body2"
                      color={'#BA1A1A'}
                    >
                      {props.rowData.status}
                    </Typography>
                  );
                }
                if (props.rowData.status === 'Live') {
                  return (
                    <Typography
                      className="one-line-text"
                      sx={{ fontSize: '14px', fontWeight: 500 }}
                      variant="body2"
                      color={'#06A816'}
                    >
                      {props.rowData.status}
                    </Typography>
                  );
                }
              } else if (props.column.key === 'create-by') {
                if (props?.rowData?.creator || props?.rowData?.author)
                  return (
                    <Typography
                      sx={{ fontSize: '14px', fontWeight: 500 }}
                      variant="body2"
                      color={'#987100'}
                    >
                      {props?.rowData?.creator || props?.rowData?.author}
                    </Typography>
                  );
                else
                  return (
                    <Typography
                      sx={{ fontSize: '14px', fontWeight: 500 }}
                      variant="body2"
                      color={'#987100'}
                    >
                      -
                    </Typography>
                  );
              } else if (props.column.key === 'contentAction') {
                {
                  return (
                    <Box display="flex">
                      <ActionIcon rowData={props.rowData} />
                      {showQrCodeButton && props.rowData.status === 'Live' && (
                        <>
                          <IconButton
                            onClick={() => {
                              // console.log('rowData', props.rowData);
                              handleOpenQrModal(
                                props.rowData.contentType === 'Course'
                                  ? `${process.env.NEXT_PUBLIC_POS_URL}/pos/content/${props.rowData.identifier}?activeLink=/pos/program`
                                  : `${process.env.NEXT_PUBLIC_POS_URL}/pos/player/${props.rowData.identifier}?activeLink=/pos/program`
                              );
                            }}
                          >
                            <QrCode2Icon />{' '}
                          </IconButton>

                          {/* ✅ Copy to Clipboard Button */}
                          <IconButton
                            onClick={() => {
                              const link =
                                props.rowData.contentType === 'Course'
                                  ? `${process.env.NEXT_PUBLIC_POS_URL}/pos/content/${props.rowData.identifier}?activeLink=/pos/program`
                                  : `${process.env.NEXT_PUBLIC_POS_URL}/pos/player/${props.rowData.identifier}?activeLink=/pos/program`;

                              navigator.clipboard.writeText(link).then(() => {
                                // Optional: show a tooltip or alert
                                console.log('Link copied to clipboard');
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </IconButton>

                          <QrModal
                            open={openQrCodeModal}
                            onClose={() => setOpenQrCodeModal(false)}
                            qrValue={selectedQrValue}
                          />
                        </>
                      )}
                    </Box>
                  );
                }
              } else if (props.column.key === 'action') {
                return (
                  <Box display={'flex'}>
                    <Box onClick={handleOpen}>
                      <ActionIcon rowData={props.rowData} />
                    </Box>
                    {showQrCodeButton && (
                      <>
                        <IconButton
                          onClick={() => {
                            // console.log('rowData', props.rowData);
                            handleOpenQrModal(
                              props.rowData.contentType === 'Course'
                                ? `${process.env.NEXT_PUBLIC_POS_URL}/pos/content/${props.rowData.identifier}?activeLink=/pos/program`
                                : `${process.env.NEXT_PUBLIC_POS_URL}/pos/player/${props.rowData.identifier}?activeLink=/pos/program`
                            );
                          }}
                        >
                          <QrCode2Icon />{' '}
                        </IconButton>

                        {/* ✅ Copy to Clipboard Button */}
                        <IconButton
                          onClick={() => {
                            const link =
                              props.rowData.contentType === 'Course'
                                ? `${process.env.NEXT_PUBLIC_POS_URL}/pos/content/${props.rowData.identifier}?activeLink=/pos/program`
                                : `${process.env.NEXT_PUBLIC_POS_URL}/pos/player/${props.rowData.identifier}?activeLink=/pos/program`;

                            navigator.clipboard.writeText(link).then(() => {
                              // Optional: show a tooltip or alert
                              console.log('Link copied to clipboard');
                            });
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>

                        <QrModal
                          open={openQrCodeModal}
                          onClose={() => setOpenQrCodeModal(false)}
                          qrValue={selectedQrValue}
                        />
                      </>
                    )}
                  </Box>
                );
              } else if (props.column.key === 'contentType') {
                return (
                  <Typography
                    className="one-line-text"
                    sx={{ fontSize: '14px' }}
                    variant="body2"
                  >
                    {props?.rowData?.contentType}
                  </Typography>
                );
              } else if (props.column.key === 'lastUpdatedOn') {
                return (
                  <Typography
                    className="one-line-text"
                    sx={{ fontSize: '14px' }}
                    variant="body2"
                  >
                    {props?.rowData?.lastUpdatedOn}
                  </Typography>
                );
              }

              return props.children;
            },
          },
        }}
        noData={{
          text: 'No data found',
        }}
      />
    </>
  );
};

export default KaTableComponent;
