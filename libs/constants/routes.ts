import { UserRole } from '@libs/common/schemas/user.schema';

/**
 * Routing path and target server mapping information
 */
export const ROUTE_MAP = [
  { prefix: '/api/v1/auth', target: 'http://auth:3001' },
  { prefix: '/api/v1/events', target: 'http://event:3003' },
  { prefix: '/api/v1/rewards', target: 'http://event:3003' },
];

/**
 * List of routes that do not require JWT authentication
 */
export const PUBLIC_ROUTES = [
  { path: '/api/v1/auth/register', method: 'POST' },
  { path: '/api/v1/auth/login', method: 'POST' },
];

/**
 * Role-based permission mapping by path and method
 *
 * key: `${path}:${method}` format to specify roles for each path and HTTP method combination
 */
export const PATH_ROLE_MAP: Record<string, UserRole[]> = {
  // Auth server related routes
  '/api/v1/auth/profile:GET': [
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.OPERATOR,
    UserRole.AUDITOR,
  ],

  // Events server related routes
  '/api/v1/events:GET': [
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.OPERATOR,
    UserRole.AUDITOR,
  ],
  '/api/v1/events:POST': [UserRole.OPERATOR, UserRole.ADMIN],
  '/api/v1/events/:id:GET': [
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.OPERATOR,
    UserRole.AUDITOR,
  ],
  '/api/v1/events/:id:PUT': [UserRole.OPERATOR, UserRole.ADMIN],
  '/api/v1/events/:id:DELETE': [UserRole.ADMIN],

  // Rewards server related routes
  '/api/v1/rewards:GET': [UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/api/v1/rewards:POST': [UserRole.OPERATOR, UserRole.ADMIN],
  '/api/v1/rewards/:id:GET': [
    UserRole.OPERATOR,
    UserRole.ADMIN,
    UserRole.AUDITOR,
  ],
  '/api/v1/rewards/event/:eventId:GET': [
    UserRole.OPERATOR,
    UserRole.ADMIN,
    UserRole.AUDITOR,
  ],
  '/api/v1/rewards/request:POST': [UserRole.USER, UserRole.ADMIN],
  '/api/v1/rewards/histories:GET': [
    UserRole.AUDITOR,
    UserRole.ADMIN,
    UserRole.OPERATOR,
  ],
  '/api/v1/rewards/histories/me:GET': [
    UserRole.USER,
    UserRole.ADMIN,
    UserRole.OPERATOR,
    UserRole.AUDITOR,
  ],
};

/**
 * Path pattern mapping information
 *
 * Pattern information for mapping routes with wildcards or parameters to their normalized form
 */
export const PATH_PATTERNS = [
  // Order matters! More specific patterns must come first
  // Reward history endpoints - using exact path matching without regex
  {
    pattern: '/api/v1/rewards/histories/me',
  },
  {
    pattern: '/api/v1/rewards/histories',
  },
  // Other reward endpoints
  {
    pattern: '/api/v1/rewards/event/:eventId',
    paramRegex: /\/api\/v1\/rewards\/event\/([^/]+)$/,
  },
  // Event endpoints
  { pattern: '/api/v1/events/:id', paramRegex: /\/api\/v1\/events\/([^/]+)$/ },
  {
    pattern: '/api/v1/rewards/:id',
    paramRegex: /\/api\/v1\/rewards\/([^/]+)$/,
  },
];
