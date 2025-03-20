import { MenuItemType } from "../../types/menu";


export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'tabler:home',
    // badge: {
    //   text: "5",
    //   variant: "success",
    // },
    url: '/dashboard/sales',
  },
  // {
  //   key: 'clinic',
  //   label: 'Clinic',
  //   icon: 'tabler:building-hospital',
  //   url: '/dashboard/clinic',
  // },
  // {
  //   key: 'wallet',
  //   label: 'eWallet',
  //   icon: 'tabler:wallet',
  //   badge: {
  //     variant: 'danger',
  //   },
  //   badgeIcon: 'tabler:info-triangle',
  //   url: '/dashboard/wallet',
  // },
  // {
  //   key: 'apps',
  //   label: 'Apps & Pages',
  //   isTitle: true
  // },
  {
    key: 'purchase',
    label: 'Purchase',
    icon: 'tabler:shopping-bag-edit',
    url: '/apps/purchase',
  },
  {
    key: 'wholesale',
    label: 'Wholesale',
    icon: 'tabler:inbox',
    url: '/apps/wholesale',
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: 'tabler:calendar',
    url: '/inventory/products',
  },
  {
    key: 'config',
    label: 'Config',
    icon: 'tabler:medical-cross',
    children: [
      {
        key: 'users',
        label: 'Users',
        url: '/config/users',
        parentKey: 'hospital',
      },
      {
        key: 'categories',
        label: 'Categories',
        url: '/config/categories',
        parentKey: 'config',
      },
    ]
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'tabler:file-invoice',
    children: [
      // {
      //   key: 'balances',
      //   label: 'Balances',
      //   url: '/hospital/users',
      //   parentKey: 'reports',
      // },
      {
        key: 'outofstock',
        label: 'Out of stock',
        url: '/reports/outofstock',
        parentKey: 'reports',
      },
      {
        key: 'lowinventory',
        label: 'Low inventory',
        url: '/reports/lowinventory',
        parentKey: 'reports',
      },
    ]
  },
  // {
  //   key: 'logout',
  //   label: 'Logout',
  //   icon: 'tabler:logout',
  //   url: '/apps/logout',
  // },

 ]

export const HORIZONTAL_MENU_ITEM: MenuItemType[] = [
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: 'tabler:dashboard',
    children: [
      {
        key: 'sales',
        label: 'Sales',
        url: '/dashboard/sales',
        parentKey: 'dashboards',
      },
      {
        key: 'clinic',
        label: 'Clinic',
        url: '/dashboard/clinic',
        parentKey: 'dashboards',
      },
      {
        key: 'wallet',
        label: 'eWallet',
        url: '/dashboard/wallet',
        parentKey: 'dashboards',
      },
    ]
  },
  {
    key: 'apps',
    label: 'Apps',
    icon: 'tabler:apps',
    children: [
      {
        key: 'chat',
        label: 'Chat',
        url: '/apps/chat',
        parentKey: 'apps',
      },
      {
        key: 'calendar',
        label: 'Calendar',
        url: '/apps/calendar',
        parentKey: 'apps',
      },
      {
        key: 'email',
        label: 'Email',
        url: '/apps/email',
        parentKey: 'apps',
      },
      {
        key: 'file-manager',
        label: 'File Manager',
        url: '/apps/file-manager',
        parentKey: 'apps',
      },
      {
        key: 'hospital',
        label: 'Hospital',
        parentKey: 'apps',
        children: [
          {
            key: 'doctors',
            label: 'Doctors',
            url: '/hospital/doctors',
            parentKey: 'hospital',
          },
          {
            key: 'doctor-details',
            label: 'Doctor Details',
            url: '/hospital/doctors-details',
            parentKey: 'hospital',
          },
          {
            key: 'add-doctors',
            label: 'Add Doctors',
            url: '/hospital/add-doctors',
            parentKey: 'hospital',
          },
          {
            key: 'Patients',
            label: 'Patients',
            url: '/hospital/patients',
            parentKey: 'hospital',
          },
          {
            key: 'patients-details',
            label: 'Patient Details',
            url: '/hospital/patients-details',
            parentKey: 'hospital',
          },
          {
            key: 'add-patients',
            label: 'Add Patient',
            url: '/hospital/add-patients',
            parentKey: 'hospital',
          },
          {
            key: 'appointments',
            label: 'Appointments',
            url: '/hospital/appointments',
            parentKey: 'hospital',
          },
          {
            key: 'payments',
            label: 'Payments',
            url: '/hospital/payments',
            parentKey: 'hospital',
          },
          {
            key: 'departments',
            label: 'Departments',
            url: '/hospital/departments',
            parentKey: 'hospital',
          },
          {
            key: 'reviews',
            label: 'Reviews',
            url: '/hospital/reviews',
            parentKey: 'hospital',
          },
          {
            key: 'contacts',
            label: 'Hospital Contacts',
            url: '/hospital/contacts',
            parentKey: 'hospital',
          },
          {
            key: 'staffs',
            label: 'Staffs',
            url: '/hospital/staffs',
            parentKey: 'hospital',
          },
        ]
      },
      {
        key: 'e-commerce',
        label: 'Ecommerce',
        parentKey: 'apps',
        children: [
          {
            key: 'products',
            label: 'Products',
            url: '/e-commerce/products',
            parentKey: 'e-commerce',
          },
          {
            key: 'products-grid',
            label: 'Products Grid',
            url: '/e-commerce/products-grid',
            parentKey: 'e-commerce',
          },
          {
            key: 'product-details',
            label: 'Products Details',
            url: '/e-commerce/product-details',
            parentKey: 'e-commerce',
          },
          {
            key: 'add-products',
            label: 'Add Products',
            url: '/e-commerce/add-products',
            parentKey: 'e-commerce',
          },
          {
            key: 'categories',
            label: 'Categories',
            url: '/e-commerce/categories',
            parentKey: 'e-commerce',
          },
          {
            key: 'orders',
            label: 'Orders',
            url: '/e-commerce/orders',
            parentKey: 'e-commerce',
          },
          {
            key: 'order-details',
            label: 'Order Details',
            url: '/e-commerce/order-details',
            parentKey: 'e-commerce',
          },
          {
            key: 'customers',
            label: 'Customers',
            url: '/e-commerce/customers',
            parentKey: 'e-commerce',
          },
          {
            key: 'sellers',
            label: 'Sellers',
            url: '/e-commerce/sellers',
            parentKey: 'e-commerce',
          },
        ]
      },
      {
        key: 'invoice',
        label: 'Invoice',
        parentKey: 'apps',
        children: [
          {
            key: 'invoices',
            label: 'Invoice',
            url: '/invoices',
            parentKey: 'invoice',
          },
          {
            key: 'view-invoice',
            label: 'View Invoice',
            url: '/invoices/view-invoice',
            parentKey: 'invoice',
          },
          {
            key: 'create-invoice',
            label: 'Create Invoice',
            url: '/invoices/create-invoice',
            parentKey: 'invoice',
          },
        ]
      },
    ]
  },
  {
    key: 'pages',
    label: 'Pages',
    icon: 'tabler:file-description',
    children: [
      {
        key: 'auth',
        label: 'Authentication',
        parentKey: 'pages',
        children: [
          {
            key: 'login',
            label: 'Login',
            url: '/auth/login',
            parentKey: 'auth',
          },
          {
            key: 'register',
            label: 'Register',
            url: '/auth/register',
            parentKey: 'auth',
          },
          {
            key: 'logout',
            label: 'Logout',
            url: '/auth/logout',
            parentKey: 'auth',
          },
          {
            key: 'recover-password',
            label: 'Recover Password',
            url: '/auth/recover-password',
            parentKey: 'auth',
          },
          {
            key: 'create-password',
            label: 'Create Password',
            url: '/auth/create-password',
            parentKey: 'auth',
          },
          {
            key: 'lock-screen',
            label: 'Lock Screen',
            url: '/auth/lock-screen',
            parentKey: 'auth',
          },
          {
            key: 'confirm-mail',
            label: 'Confirm Mail',
            url: '/auth/confirm-mail',
            parentKey: 'auth',
          },
          {
            key: 'login-pin',
            label: 'Login with PIN',
            url: '/auth/login-pin',
            parentKey: 'auth',
          },
          {
            key: '2FA',
            label: '2FA',
            url: '/auth/two-factor',
            parentKey: 'auth',
          },
          {
            key: 'account-deactivation',
            label: 'Account Deactivation',
            url: '/auth/account-deactivation',
            parentKey: 'auth',
          },
        ]
      },
      {
        key: 'errors',
        label: 'Error Pages',
        parentKey: 'pages',
        children: [
          {
            key: 'error-401',
            label: '401 Unauthorized',
            url: '/errors/error-401',
            parentKey: 'errors',
          },
          {
            key: 'error-400',
            label: '400 Bad Reques',
            url: '/errors/error-400',
            parentKey: 'errors',
          },
          {
            key: 'error-403',
            label: '403 Forbidden',
            url: '/errors/error-403',
            parentKey: 'errors',
          },
          {
            key: 'error-404',
            label: '404 Not Found',
            url: '/errors/error-404',
            parentKey: 'errors',
          },
          {
            key: 'error-408',
            label: '408 Request Timeout',
            url: '/errors/error-408',
            parentKey: 'errors',
          },
          {
            key: 'error-500',
            label: '500 Internal Server',
            url: '/errors/error-500',
            parentKey: 'errors',
          },
          {
            key: 'error-501',
            label: '501 Not Implemented',
            url: '/errors/error-501',
            parentKey: 'errors',
          },
          {
            key: 'error-502',
            label: '502 Service Overloaded',
            url: '/errors/error-502',
            parentKey: 'errors',
          },
          {
            key: 'service-unavailable',
            label: 'Service Unavailable',
            url: '/errors/service-unavailable',
            parentKey: 'errors',
          },
        ]
      },
      {
        key: 'starter-page',
        label: 'Starter Page',
        url: '/pages/starter-page',
        parentKey: 'pages',
      },
      {
        key: 'faq',
        label: 'FAQ',
        url: '/pages/faq',
        parentKey: 'pages',
      },
      {
        key: 'pricing-one',
        label: 'Pricing One',
        url: '/pages/pricing-one',
        parentKey: 'pages',
      },
      {
        key: 'pricing-two',
        label: 'Pricing Two',
        url: '/pages/pricing-two',
        parentKey: 'pages',
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        url: '/maintenance',
        parentKey: 'pages',
      },
      {
        key: 'timeline',
        label: 'Timeline',
        url: '/pages/timeline',
        parentKey: 'pages',
      },
    ]
  },
  {
    key: 'components',
    label: 'Components',
    icon: 'tabler:components',
    children: [
      {
        key: 'widgets',
        label: 'Widgets',
        url: '/wallet',
        parentKey: 'components',
      },
      {
        key: 'base-ui',
        label: 'Base UI',
        children: [
          {
            key: 'base-ui-accordions',
            label: 'Accordions',
            url: '/ui/accordions',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-alerts',
            label: 'Alerts',
            url: '/ui/alerts',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-avatars',
            label: 'Avatars',
            url: '/ui/avatars',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-badges',
            label: 'Badges',
            url: '/ui/badges',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-breadcrumb',
            label: 'Breadcrumb',
            url: '/ui/breadcrumb',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-buttons',
            label: 'Buttons',
            url: '/ui/buttons',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-cards',
            label: 'Cards',
            url: '/ui/cards',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-carousel',
            label: 'Carousel',
            url: '/ui/carousel',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-collapse',
            label: 'Collapse',
            url: '/ui/collapse',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-dropdowns',
            label: 'Dropdowns',
            url: '/ui/dropdowns',
            parentKey: 'base-ui',
          },
          {
            key: 'ul-ratio',
            label: 'Ratio',
            url: '/ui/ratio',
            parentKey: 'base-ui',
          },
          {
            key: 'ul-grid',
            label: 'Grid',
            url: '/ui/grid',
            parentKey: 'base-ui',
          },
          {
            key: 'ul-links',
            label: 'Links',
            url: '/ui/links',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-list-group',
            label: 'List Group',
            url: '/ui/list-group',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-modals',
            label: 'Modals',
            url: '/ui/modals',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-notifications',
            label: 'Notifications',
            url: '/ui/notifications',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-offcanvas',
            label: 'Offcanvas',
            url: '/ui/offcanvas',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-placeholders',
            label: 'Placeholders',
            url: '/ui/placeholders',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-pagination',
            label: 'Pagination',
            url: '/ui/pagination',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-popovers',
            label: 'Popovers',
            url: '/ui/popovers',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-progress',
            label: 'Progress',
            url: '/ui/progress',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-spinners',
            label: 'Spinners',
            url: '/ui/spinners',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-tabs',
            label: 'Tabs',
            url: '/ui/tabs',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-tooltips',
            label: 'Tooltips',
            url: '/ui/tooltips',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-typography',
            label: 'Typography',
            url: '/ui/typography',
            parentKey: 'base-ui',
          },
          {
            key: 'base-ui-utilities',
            label: 'Utilities',
            url: '/ui/utilities',
            parentKey: 'base-ui',
          },
        ]
      },
      {
        key: 'extended-ui',
        label: 'Extended UI',
        children: [
          {
            key: 'dragula',
            label: 'Dragula',
            url: '/extended/dragula',
            parentKey: 'extended-ui',
          },
          {
            key: 'sweet-alert',
            label: 'Sweet Alert',
            url: '/extended/sweet-alert',
            parentKey: 'extended-ui',
          },
          {
            key: 'ratings',
            label: 'Ratings',
            url: '/extended/ratings',
            parentKey: 'extended-ui',
          },
          {
            key: 'scrollbar',
            label: 'Scrollbar',
            url: '/extended/scrollbar',
            parentKey: 'extended-ui',
          },
        ]
      },
      {
        key: 'forms',
        label: 'Forms',
        children: [
          {
            key: 'basic-table',
            label: 'Basic Elements',
            url: '/forms/basic-table',
            parentKey: 'forms',
          },
          {
            key: 'inputmask',
            label: 'Inputmask',
            url: '/forms/inputmask',
            parentKey: 'forms',
          },
          {
            key: 'picker',
            label: 'Picker',
            url: '/forms/picker',
            parentKey: 'forms',
          },
          {
            key: 'select',
            label: 'Select',
            url: '/forms/select',
            parentKey: 'forms',
          },
          {
            key: 'slider',
            label: 'Range Slider',
            url: '/forms/slider',
            parentKey: 'forms',
          },
          {
            key: 'validation',
            label: 'Validation',
            url: '/forms/validation',
            parentKey: 'forms',
          },
          {
            key: 'wizard',
            label: 'Wizard',
            url: '/forms/wizard',
            parentKey: 'forms',
          },
          {
            key: 'file-uploads',
            label: 'File Uploads',
            url: '/forms/file-uploads',
            parentKey: 'forms',
          },
          {
            key: 'editors',
            label: 'Editors',
            url: '/forms/editors',
            parentKey: 'forms',
          },
          {
            key: 'layouts',
            label: 'Layouts',
            url: '/forms/layouts',
            parentKey: 'forms',
          },
        ]
      },
      {
        key: 'charts',
        label: 'charts',
        children: [
          {
            key: 'area',
            label: 'area',
            url: '/charts/area',
            parentKey: 'charts',
          },
          {
            key: 'bar',
            label: 'Bar',
            url: '/charts/bar',
            parentKey: 'charts',
          },
          {
            key: 'bubble',
            label: 'Bubble',
            url: '/charts/bubble',
            parentKey: 'charts',
          },
          {
            key: 'candlestick',
            label: 'Candlestick',
            url: '/charts/candlestick',
            parentKey: 'charts',
          },
          {
            key: 'column',
            label: 'Column',
            url: '/charts/column',
            parentKey: 'charts',
          },
          {
            key: 'heatmap',
            label: 'Heatmap',
            url: '/charts/heatmap',
            parentKey: 'charts',
          },
          {
            key: 'line',
            label: 'Line',
            url: '/charts/line',
            parentKey: 'charts',
          },
          {
            key: 'mixed',
            label: 'Mixed',
            url: '/charts/mixed',
            parentKey: 'charts',
          },
          {
            key: 'timeline-chart',
            label: 'Timeline',
            url: '/charts/timeline',
            parentKey: 'charts',
          },
          {
            key: 'boxplot',
            label: 'Boxplot',
            url: '/charts/boxplot',
            parentKey: 'charts',
          },
          {
            key: 'treemap',
            label: 'Treemap',
            url: '/charts/treemap',
            parentKey: 'charts',
          },
          {
            key: 'pie',
            label: 'Pie',
            url: '/charts/pie',
            parentKey: 'charts',
          },
          {
            key: 'radar',
            label: 'Radar',
            url: '/charts/radar',
            parentKey: 'charts',
          },
          {
            key: 'radialBar',
            label: 'RadialBar',
            url: '/charts/radialBar',
            parentKey: 'charts',
          },
          {
            key: 'scatter',
            label: 'Scatter',
            url: '/charts/scatter',
            parentKey: 'charts',
          },
          {
            key: 'polar',
            label: 'Polar Area',
            url: '/charts/polar',
            parentKey: 'charts',
          },
          {
            key: 'sparklines',
            label: 'Sparklines',
            url: '/charts/sparklines',
            parentKey: 'charts',
          },
        ],
      },
      {
        key: 'tables',
        label: 'Tables',
        children: [
          {
            key: 'basics-table',
            label: 'Basic Tables',
            url: '/tables/basics-table',
            parentKey: 'tables',
          },
          {
            key: 'gridJs',
            label: 'GridJs Tables',
            url: '/tables/gridJs',
            parentKey: 'tables',
          },
        ]
      },
      {
        key: 'icons',
        label: 'Icons',
        children: [
          {
            key: 'tabler',
            label: 'Tabler',
            url: '/icons/tabler',
            parentKey: 'icons',
          },
          {
            key: 'solar',
            label: 'Solar',
            url: '/icons/solar',
            parentKey: 'icons',
          },
        ]
      },
      {
        key: 'maps',
        label: 'Maps',
        children: [
          {
            key: 'google',
            label: 'Google Maps',
            url: '/maps/google',
            parentKey: 'maps',
          },
          {
            key: 'vector',
            label: 'Vector Maps',
            url: '/maps/vector',
            parentKey: 'maps',
          },
          {
            key: 'leaflet',
            label: 'Leaflet Maps',
            url: '/maps/leaflet',
            parentKey: 'maps',
          },
        ]
      },
    ]
  },
  {
    key: 'layouts',
    label: 'Layouts',
    icon: 'solar:window-frame-outline',
    children: [
      {
        key: 'horizontal',
        label: 'Horizontal',
        url: '/layouts/horizontal',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'detached',
        label: 'Detached',
        target: '_blank',
        url: '/layouts/detached',
        parentKey: 'layouts',
      },
      {
        key: 'full-view',
        label: 'Full View',
        url: '/layouts/full-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'fullscreen-view',
        label: 'FullScreen View',
        url: '/layouts/fullscreen-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'hover-menu',
        label: 'Hover Menu',
        url: '/layouts/hover-menu',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'compact',
        label: 'Compact',
        url: '/layouts/compact',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'icon-view',
        label: 'Icon View',
        url: '/layouts/icon-view',
        parentKey: 'layouts',
        target: '_blank',
      },
      {
        key: 'dark-mode',
        label: 'Dark Mode',
        url: '/layouts/dark-mode',
        parentKey: 'layouts',
        target: '_blank',
      },
    ],
  },
]