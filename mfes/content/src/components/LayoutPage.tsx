import React from 'react';
import { Layout, LayoutProps, Loader } from '@shared-lib';

interface newLayoutProps extends LayoutProps {
  isShow?: boolean;
}

export default function LayoutPage({
  isLoadingChildren,
  isShow,
  children,
  ...props
}: newLayoutProps) {
  if (isShow === undefined || isShow) {
    return (
      <Layout
        isLoadingChildren={isLoadingChildren}
        _topAppBar={{
          title: 'Pratham: Home',
          actionButtonLabel: 'Action',
        }}
        onlyHideElements={['footer']}
        {...props}
      >
        {children}
      </Layout>
    );
  } else {
    return (
      <Loader isLoading={isLoadingChildren || false} isHideMaxHeight>
        {children}
      </Loader>
    );
  }
}
