import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { NextAppProvider } from '@toolpad/core/nextjs'
import theme from '@/theme'
import NAVIGATION from '@/constant/navigation'
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import FactoryIcon from '@mui/icons-material/Factory';

const branding = {
  logo: <FactoryIcon fontSize="large" color="primary" />,
  title: 'Smart Manufacture',
  homeUrl: '/'
}

export default function RootLayout(props) {
  const { children } = props;
  return (
    <html>
      <body>
        <AppRouterCacheProvider>
          <NextAppProvider
            theme={theme}
            navigation={NAVIGATION}
            branding={branding}
          >
            <DashboardLayout>
              {children}
            </DashboardLayout>
          </NextAppProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}