/**
 * RouteGuard - Protects routes that require authentication
 * Checks if user is logged in before allowing access to protected routes
 */

import { SessionManager } from './SessionManager.js';

export class RouteGuard {
  /**
   * List of routes that require authentication
   */
  static PROTECTED_ROUTES = ['/manage', '/settings'];

  /**
   * Check if a route requires authentication
   * @param {string} path - Route path to check
   * @returns {boolean} True if route is protected
   */
  static isProtectedRoute(path) {
    // Remove trailing slash and query parameters for comparison
    const cleanPath = path.split('?')[0].replace(/\/$/, '');
    
    return this.PROTECTED_ROUTES.some(route => {
      const cleanRoute = route.replace(/\/$/, '');
      return cleanPath === cleanRoute || cleanPath.startsWith(cleanRoute + '/');
    });
  }

  /**
   * Guard a route - redirect to login if not authenticated
   * @param {string} path - Target path
   * @param {Function} next - Function to call if access is allowed
   * @param {Function} redirect - Function to call to redirect (receives path)
   * @returns {boolean} True if access is allowed
   */
  static guard(path, next, redirect) {
    if (!this.isProtectedRoute(path)) {
      // Public route, allow access
      next();
      return true;
    }

    // Protected route, check authentication
    const sessionManager = new SessionManager();
    if (sessionManager.validateSession()) {
      // User is authenticated, allow access
      next();
      return true;
    }

    // User is not authenticated, redirect to login
    const encodedRedirect = encodeURIComponent(path);
    redirect(`/login?redirect=${encodedRedirect}`);
    return false;
  }

  /**
   * Check if user can access a route (without redirecting)
   * @param {string} path - Route path to check
   * @returns {boolean} True if user can access the route
   */
  static canAccess(path) {
    if (!this.isProtectedRoute(path)) {
      return true;
    }

    const sessionManager = new SessionManager();
    return sessionManager.validateSession();
  }
}
