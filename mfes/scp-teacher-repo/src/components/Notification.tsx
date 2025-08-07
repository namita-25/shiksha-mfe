import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { onMessageListener } from './../../firebase';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { onMessage } from 'firebase/messaging';

type NotificationData = {
  title: string;
  body: string;
  icon: string;
  navigate_to?: string;
};

const Notification = () => {
  const [notification, setNotification] = useState<NotificationData>({
    title: '',
    body: '',
    icon: '',
  });

  const router = useRouter();
console.log("notification teacher app")
  const notify = () =>
    toast(<ToastDisplay />, {
      duration: 4000,
    });

  const closeNotification = () => toast.dismiss();

  const handleNotificationClick = () => {
    if (notification.navigate_to) {
      try {
        const url = new URL(notification.navigate_to);
        const pathname = url.pathname;
        router.push(pathname);
      } catch (error) {
        console.error("Invalid URL:", notification.navigate_to);
      }
    }
  };

  function ToastDisplay() {
    return (
      <Box
      className="notification-container"
      sx={{ display: 'flex', gap: '8px' }}
      onClick={handleNotificationClick}
    >
      {notification.icon && (
        <img
          className="notification-icon"
          src={notification.icon}
          alt="Notification"
        />
      )}

      <Box>
        <Box sx={{ fontSize: '16px', fontWeight: '500', color: '#019722' }}>
          {notification.title}
        </Box>
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: '400',
            color: '#1F1B13',
            marginTop: '8px',
          }}
        >
          {notification.body}
        </Box>
      </Box>
      <Box
        className="close-icon"
        onClick={(e) => {
          e.stopPropagation();
          closeNotification();
        }}
      >
        <CloseIcon
          sx={{ color: '#1C1B1F', fontSize: '16px', cursor: 'pointer' }}
        />
      </Box>
    </Box>
    );
  }

  useEffect(() => {
    if (notification.title) {
      notify();
    }
  }, [notification]);
//   useEffect(() => {
//   const unsubscribe = onMessage(messaging, (payload) => {
//     console.log('Foreground message received:', payload);
//     if (payload.notification?.title) {
//       setNotification({
//         title: payload.notification.title,
//         body: payload.notification.body|| "",
//         icon: payload.notification.icon ||"",
//         navigate_to: payload.data?.navigate_to,
//       });
//     }
//   });

//   return () => unsubscribe();
// }, []);
  onMessageListener()
    .then((payload) => {
      if (payload.notification?.title) {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
          icon: payload.notification.icon,
          navigate_to: payload.notification.navigate_to,
        });
      }
    })
    .catch((err) => console.log('failed: ', err));

  return <Toaster />;
};

export default Notification;
