import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    // badge: {
    //   color: 'info',
    //   text: 'NEW'
    // }
  },
  {
    title: true,
    name: 'SURADA Menus'
  },
  {
    name: 'Settings',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [{
      name: 'Accounts',
      url: '/Bankbook/4',
      iconComponent: { name: 'cil-people' }
    },
    {
      name: 'Tax Setup',
      url: '/Bankbook/3',
      iconComponent: { name: 'cil-people' }
    }, {
      name: 'Linked Accounts',
      url: '/linked-accounts',
      iconComponent: { name: 'cil-people' }
    },
    {
      name: 'Holidays',
      url: '/Bankbook/6',
      iconComponent: { name: 'cil-cash' }
    },
    {
      name: 'Document Types',
      url: '/Bankbook/7',
      iconComponent: { name: 'cil-cash' }
    },
    ]
  },
  {
    name: 'Master',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        name: 'Room Type',
        url: '/room-types',
        iconComponent: { name: 'cil-people' }
      },


      {
        name: 'Rate Master',
        url: '/rate-types',
        iconComponent: { name: 'cil-people' }
      },

      {
        name: 'Bulding Owner',
        url: '/Bankbook/2',
        iconComponent: { name: 'cil-people' }
      },
      {
        name: 'Bulding',
        url: '/Bulding',
        iconComponent: { name: 'cil-people' }
      }
      ,
      {
        name: 'Rooms',
        url: '/Rooms',
        iconComponent: { name: 'cil-people' }
      }
      ,

      {
        name: 'Coupons',
        url: '/coupon',
        iconComponent: { name: 'cil-cash' }
      }


      ,]
  },
  {
    name: 'Transactions',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        name: 'Guest',
        url: '/member',
        iconComponent: { name: 'cil-people' }
      },
      {
        name: 'Book now',
        url: '/booknow',
        iconComponent: { name: 'cil-people' }
      }
      ,
      {
        name: 'Check-In',
        url: '/checkin',
        iconComponent: { name: 'cil-people' }
      }

      , {
        name: 'Bank Payment',
        url: '/Bankbook/1',
        iconComponent: { name: 'cil-people' }
      },
      {
        name: 'Receipt',
        url: '/Receipt',
        iconComponent: { name: 'cil-people' }

      },
      {
        name: 'Check-Out',
        url: '/checkout',
        iconComponent: { name: 'cil-people' }

      }
    ]
  }
];
export const navItems1: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    // badge: {
    //   color: 'info',
    //   text: 'NEW'
    // }
  },

  {
    title: true,
    name: 'Theme'
  },
  {
    name: 'Coupons',
    url: '/coupon',
    iconComponent: { name: 'cil-cash' }
  },
  {
    name: 'Members',
    url: '/member',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Rroom Type',
    url: '/room-types',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Rate Master',
    url: '/rate-types',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Linked Accounts',
    url: '/linked-accounts',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Bulding',
    url: '/Bulding',
    iconComponent: { name: 'cil-people' }
  }
  ,
  {
    name: 'Rooms',
    url: '/Rooms',
    iconComponent: { name: 'cil-people' }
  }
  ,
  {
    name: 'Book now',
    url: '/booknow',
    iconComponent: { name: 'cil-people' }
  }
  ,
  {
    name: 'Check-In',
    url: '/checkin',
    iconComponent: { name: 'cil-people' }
  }
  , {
    name: 'Bank book',
    url: '/Bankbook',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Receipt',
    url: '/Receipt',
    iconComponent: { name: 'cil-people' }
  },

  {
    name: 'Colors',
    url: '/theme/colors',
    iconComponent: { name: 'cil-drop' }
  },
  {
    name: 'Typography',
    url: '/theme/typography',
    linkProps: { fragment: 'someAnchor' },
    iconComponent: { name: 'cil-pencil' }
  },
  {
    name: 'Components',
    title: true
  },
  {
    name: 'Base',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        name: 'Accordion',
        url: '/base/accordion'
      },
      {
        name: 'Breadcrumbs',
        url: '/base/breadcrumbs'
      },
      {
        name: 'Cards',
        url: '/base/cards'
      },
      {
        name: 'Carousel',
        url: '/base/carousel'
      },
      {
        name: 'Collapse',
        url: '/base/collapse'
      },
      {
        name: 'List Group',
        url: '/base/list-group'
      },
      {
        name: 'Navs & Tabs',
        url: '/base/navs'
      },
      {
        name: 'Pagination',
        url: '/base/pagination'
      },
      {
        name: 'Placeholder',
        url: '/base/placeholder'
      },
      {
        name: 'Popovers',
        url: '/base/popovers'
      },
      {
        name: 'Progress',
        url: '/base/progress'
      },
      {
        name: 'Spinners',
        url: '/base/spinners'
      },
      {
        name: 'Tables',
        url: '/base/tables'
      },
      {
        name: 'Tabs',
        url: '/base/tabs'
      },
      {
        name: 'Tooltips',
        url: '/base/tooltips'
      }
    ]
  },
  {
    name: 'Buttons',
    url: '/buttons',
    iconComponent: { name: 'cil-cursor' },
    children: [
      {
        name: 'Buttons',
        url: '/buttons/buttons'
      },
      {
        name: 'Button groups',
        url: '/buttons/button-groups'
      },
      {
        name: 'Dropdowns',
        url: '/buttons/dropdowns'
      },
    ]
  },
  {
    name: 'Forms',
    url: '/forms',
    iconComponent: { name: 'cil-notes' },
    children: [
      {
        name: 'Form Control',
        url: '/forms/form-control'
      },
      {
        name: 'Select',
        url: '/forms/select'
      },
      {
        name: 'Checks & Radios',
        url: '/forms/checks-radios'
      },
      {
        name: 'Range',
        url: '/forms/range'
      },
      {
        name: 'Input Group',
        url: '/forms/input-group'
      },
      {
        name: 'Floating Labels',
        url: '/forms/floating-labels'
      },
      {
        name: 'Layout',
        url: '/forms/layout'
      },
      {
        name: 'Validation',
        url: '/forms/validation'
      }
    ]
  },
  {
    name: 'Charts',
    url: '/charts',
    iconComponent: { name: 'cil-chart-pie' }
  },
  {
    name: 'Icons',
    iconComponent: { name: 'cil-star' },
    url: '/icons',
    children: [
      {
        name: 'CoreUI Free',
        url: '/icons/coreui-icons',
        badge: {
          color: 'success',
          text: 'FREE'
        }
      },
      {
        name: 'CoreUI Flags',
        url: '/icons/flags'
      },
      {
        name: 'CoreUI Brands',
        url: '/icons/brands'
      }
    ]
  },
  {
    name: 'Notifications',
    url: '/notifications',
    iconComponent: { name: 'cil-bell' },
    children: [
      {
        name: 'Alerts',
        url: '/notifications/alerts'
      },
      {
        name: 'Badges',
        url: '/notifications/badges'
      },
      {
        name: 'Modal',
        url: '/notifications/modal'
      },
      {
        name: 'Toast',
        url: '/notifications/toasts'
      }
    ]
  },
  {
    name: 'Widgets',
    url: '/widgets',
    iconComponent: { name: 'cil-calculator' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  },
  {
    title: true,
    name: 'Extras'
  },
  {
    name: 'Pages',
    url: '/login',
    iconComponent: { name: 'cil-star' },
    children: [
      {
        name: 'Login',
        url: '/login'
      },
      {
        name: 'Register',
        url: '/register'
      },
      {
        name: 'Error 404',
        url: '/404'
      },
      {
        name: 'Error 500',
        url: '/500'
      }
    ]
  },
];
