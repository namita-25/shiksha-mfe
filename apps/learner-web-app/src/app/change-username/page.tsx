'use client';

import React, { useEffect, useRef, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { IconButton } from '@mui/material';
import Header from '@learner/components/Header/Header';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import UsernameSuggestion from '@learner/components/UsernameSuggestion/UsernameSuggestion';
import { updateUser, userNameExist } from '@learner/utils/API/userService';
import js from '@eslint/js';
import SimpleModal from '@learner/components/SimpleModal/SimpleModal';
import { checkAuth } from '@shared-lib-v2/utils/AuthService';

const ChangeUserNamePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [suggestions, setuggestions] = useState<any>([]);
  const [usernameChangedSuceesModal, setUsernameChangedSuceesModal] =
    useState(false);
  //   const suggestions = ['anagadhinesh789', 'anagadhinesh267', 'anagadhinesh342'];

  const handleContinue = async () => {
    console.log('Selected Username:', username);
    const userData = JSON.parse(localStorage.getItem('userResponse') || '{}');
    const data = {
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      username: username,
    };
    await validateUsername(data);
  };
  const handleUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement> | string
  ) => {
    if (typeof e === 'string') {
      setUsername(e);
    } else {
      setUsername(e.target.value);
    }
  };
  const validateUsername = async (userData: {
    firstName: string;
    lastName: string;
    username: string;
  }) => {
    try {
      if (suggestions.length === 0) {
        const response = await userNameExist(userData);
        setuggestions([response?.suggestedUsername]);

        console.log('response', response);
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.log(
          'Server responded with error:',
          error.response.data.params.errmsg
        );
        try {
          if (error.response.data.params.errmsg === 'User does not exist') {
            let userId = localStorage.getItem('userId');
            let userData = {
              username: username,
            };
            const object = {
              userData: userData,
            };
            if (userId) {
              const updateUserResponse = await updateUser(userId, object);
              setUsernameChangedSuceesModal(true);
            }
            // console.error('Error validating username:', error);
          }
        } catch (error) {
          console.error('Error validating username:', error);
        }
      }
    }
  };
  const onCloseSuccessModal = () => {
    //  const route = localStorage.getItem('redirectionRoute');
    //   if (route) router.push(route);

    setUsernameChangedSuceesModal(false);
    router.push('/profile');
  };
  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
    }
  }, []);
  return (
    <Layout>
      <Box
        // height="100vh"
        // width="100vw"
        display="flex"
        flexDirection="column"
        //  overflow="hidden"
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', mb: 2.5, mt: 2 }}
          onClick={() => router.back()}
        >
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <UsernameSuggestion
          value={username}
          onChange={handleUsernameChange}
          suggestions={suggestions}
          onContinue={handleContinue}
          setSuggestions={setuggestions}
        />
      </Box>
      <SimpleModal
        open={usernameChangedSuceesModal}
        onClose={onCloseSuccessModal}
        showFooter={true}
        primaryText={'Okay'}
        primaryActionHandler={onCloseSuccessModal}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection={'column'}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 48, color: 'green', mb: 2 }}
          />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 400,
              letterSpacing: '0px',
              textAlign: 'center',
              verticalAlign: 'middle',
              mb: 3,
            }}
          >
            Awesome!
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 200,
              letterSpacing: '0px',
              textAlign: 'center',
              verticalAlign: 'middle',
              mb: 3,
            }}
          >
            Your username has been successfully changed{' '}
          </Typography>
        </Box>
      </SimpleModal>
    </Layout>
  );
};

export default ChangeUserNamePage;
