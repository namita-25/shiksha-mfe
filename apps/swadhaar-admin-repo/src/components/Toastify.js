import { toast } from 'react-toastify';

const options = {
  position: 'bottom-center',
  hideProgressBar: true,
  closeButton: false,
  autoClose: 2500,
};

export const showToastMessage = (message, type = 'success') => {
  const commonOptions = {
    ...options,
    style: {
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
    },
  };

  switch (type) {
    case 'error':
      toast.error(message, {
        ...commonOptions,
        style: {
          ...commonOptions.style,
          background: '#DC3545',
        },
      });
      break;
    case 'success':
      toast.success(message, {
        ...commonOptions,
        style: {
          ...commonOptions.style,
          background: '#28A745',
        },
      });
      break;
    case 'info':
      toast.info(message, {
        ...commonOptions,
        style: {
          ...commonOptions.style,
          background: '#1C2B4A',
        },
      });
      break;
    case 'warning':
      toast.warning(message, {
        ...commonOptions,
        style: {
          ...commonOptions.style,
          background: '#E6873C',
        },
      });
      break;
    default:
      toast(message, commonOptions);
  }
};
