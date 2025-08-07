import React from 'react';
import {
  Avatar,
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Grid,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme } from '@mui/material/styles';
import { getAge, getAgeInMonths } from '../../utils/Helper';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { VolunteerField } from '../../utils/app.constant';
import { toPascalCase } from '@/utils/Helper';
type UserCardProps = {
  name: string;
  firstName?: string;
  lastName?: string;
  //showAvtar?: boolean;
  age?: string | number;
  dob?: string;
  userId?: string;
  village?: string;
  image?: string;
  joinOn?: string;
  isNew?: boolean;
  showMore?: boolean;
  totalCount?: number;
  newRegistrations?: number;
  onClick?: (Id: string, name?: string) => void;
  onToggleClick?: (name: string, id: string) => void;
  onUserClick?: (name: string) => void;
  customFields?: any;
  showAvtar?: any;
  Id?: any;
  villageCount?: any;
  blockNames?: string[];
  villageNames?: string[];
  isVolunteer?: string;
  nameRedirection?: boolean;
};

const UserCard: React.FC<UserCardProps> = ({
  name,
  userId,
  age,
  village,
  image,
  joinOn,
  isNew,
  showMore,
  totalCount,
  newRegistrations,
  onClick,
  onToggleClick,
  firstName,
  lastName,
  dob,
  customFields,
  onUserClick,
  showAvtar,
  Id,
  blockNames,
  villageCount,
  isVolunteer,
  villageNames,
  nameRedirection = true,
}) => {
  const theme = useTheme<any>();
  const { t } = useTranslation();

  return (
    <Box
      display={'flex'}
      width={'100%'}
      justifyContent={'space-between'}
      sx={{
        ...(!totalCount && {
          '@media (min-width: 600px)': {
            background: theme.palette.warning.A400,
          },
        }),
      }}
    >
      <ListItem sx={{ paddingLeft: '0px !important', paddingRight: '0px !important'}}>
        {firstName && (
          <Avatar
            src={image}
            alt={name}
            sx={{
              width: 48,
              height: 48,
              backgroundColor:
                isVolunteer === VolunteerField.YES
                  ? 'transparent'
                  : theme.palette.warning['800'],
              fontSize: 18,
              fontWeight: '400',
              color: 'black',
              border: `2px solid ${theme.palette.warning['800']}`,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isVolunteer
              ? isVolunteer === VolunteerField.YES
                ? 'V'
                : 'Y'
              : (firstName ? firstName.charAt(0).toUpperCase() : '') +
                (lastName ? lastName.charAt(0).toUpperCase() : '')}
          </Avatar>
        )}
        <Box
          ml={2}
          width={'100%'}
          sx={{
            display: totalCount ? 'flex' : 'unset',
            alignItems: totalCount ? 'center' : 'unset',
          }}
        >
          <Typography
            sx={{
              cursor: 'pointer',
              fontSize: '16px',
              color: nameRedirection ? theme.palette.secondary.main : 'black',
              textDecoration: nameRedirection ? 'underline' : 'none',

              padding: '5px 5px',
            }}
            onClick={() => {
              onClick?.(Id, name);
            }}
          >
            {toPascalCase(name)}
          </Typography>
          {villageCount && blockNames && (
            <Typography>
              {villageCount === 1
                ? `${villageCount} ${t('YOUTHNET_USERS_AND_VILLAGES.VILLAGE')}`
                : `${villageCount} ${t(
                    'YOUTHNET_USERS_AND_VILLAGES.VILLAGES'
                  )}`}
              {blockNames.length > 1
                ? ` (${blockNames} ${t('YOUTHNET_USERS_AND_VILLAGES.BLOCKS')})`
                : blockNames.length === 1
                ? ` (${blockNames} ${t('YOUTHNET_USERS_AND_VILLAGES.BLOCK')})`
                : ''}
            </Typography>
          )}
          <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
            <Box sx={{ display: 'flex', gap: '8px' }}>
              {dob ? (
                <Typography variant="body2" color="textSecondary">
                  {getAge(dob) < 0
                    ? getAgeInMonths(dob) + ' m/o'
                    : getAge(dob) + ' y/o'}{' '}
                  •{' '}
                  {joinOn
                    ? t('YOUTHNET_PROFILE.JOINED_ON') + ' ' + joinOn
                    : villageNames
                    ? villageNames
                    : ''}
                </Typography>
              ) : (
                joinOn && (
                  <Typography variant="body2" color="textSecondary">
                    {t('YOUTHNET_PROFILE.JOINED_ON')} {' ' + joinOn}
                  </Typography>
                )
              )}
              {isNew && (
                <Typography
                  variant="body2"
                  color={theme.palette.success.main}
                  fontWeight={600}
                >
                  NEW
                </Typography>
              )}
            </Box>
            {totalCount && (
              <Typography
                variant="body2"
                color="black"
                mt={'1rem'}
                fontWeight={600}
              >
                {totalCount + ' '}
                {newRegistrations?.toString() && (
                  <span
                    style={{
                      color:
                        newRegistrations < 5
                          ? theme.palette.error.main
                          : theme.palette.success.main,
                    }}
                  >
                    (<ArrowUpwardIcon sx={{ height: 16, width: 16 }} />{' '}
                    {newRegistrations})
                  </span>
                )}
              </Typography>
            )}
            {showMore && isVolunteer === VolunteerField.NO && (
              <MoreVertIcon
                sx={{
                  fontSize: '24px',
                  color: theme.palette.warning['300'],
                  cursor: 'pointer',
                }}
                onClick={() => onToggleClick?.(name, Id)}
              />
            )}
          </Box>
        </Box>
      </ListItem>
    </Box>
  );
};

type UserListProps = {
  users: UserCardProps[];
  layout?: 'list' | 'grid';
  onToggleUserClick?: (name: string) => void;
  onUserClick?: (Id: string, name?: string) => void;
  nameRedirection?: boolean;
};

export const UserList: React.FC<UserListProps> = ({
  users,
  layout = 'grid',
  onToggleUserClick,
  onUserClick,
  nameRedirection = true,
}) => {
  console.log(users);
  const router = useRouter();
  // const onUserClick=(userId: any)=>
  //   {
  //     console.log(userId)
  //     router.push(`/user-profile/${userId}`);

  //   }
  return layout === 'grid' ? (
    <List>
      <Grid container spacing={2}>
        {users.map((user, index) => (
          <React.Fragment key={index}>
            <Grid
              item
              xs={12}
              sm={12}
              md={user.totalCount ? 12 : 6}
              lg={user.totalCount ? 12 : 4}
            >
              <UserCard
                {...user}
                onClick={onUserClick}
                onToggleClick={onToggleUserClick}
                nameRedirection={nameRedirection}
              />{' '}
            </Grid>
            {index < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Grid>
    </List>
  ) : (
    <List>
      {users.map((user, index) => (
        <React.Fragment key={index}>
          <UserCard
            {...user}
            onClick={onUserClick}
            onToggleClick={onToggleUserClick}
            nameRedirection={nameRedirection}
          />
          {index < users.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};
