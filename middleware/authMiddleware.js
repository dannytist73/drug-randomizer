/**
 * Authentication middleware to protect admin routes
 */
const authMiddleware = {
  /**
   * Check if user is authenticated before allowing access to protected routes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  isAuthenticated: (req, res, next) => {
    console.log("Auth check - Session exists:", !!req.session);
    console.log("Auth check - isAuthenticated:", req.session?.isAuthenticated);
    console.log("Auth check - Session ID:", req.sessionID);

    // Check if session and authentication flag exist
    if (req.session && req.session.isAuthenticated) {
      console.log(
        "Authentication successful, user:",
        req.session.user?.username
      );
      return next();
    }

    // Store the original URL they were trying to access for redirection after login
    if (req.session) {
      req.session.returnTo = req.originalUrl;
    }

    console.log("Authentication failed, redirecting to login");

    // Redirect to login page
    res.redirect("/admin/login");
  },

  /**
   * Add debugging information to check authentication status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  debugAuth: (req, res, next) => {
    console.log("Debug Auth - Request path:", req.path);
    console.log("Debug Auth - Session:", !!req.session);
    console.log("Debug Auth - Session ID:", req.sessionID);
    console.log("Debug Auth - isAuthenticated:", req.session?.isAuthenticated);
    console.log("Debug Auth - User:", req.session?.user);
    console.log("Debug Auth - Cookie:", req.headers.cookie);

    // Add debug headers if not in production
    if (process.env.NODE_ENV !== "production") {
      res.setHeader("X-Session-ID", req.sessionID || "none");
      res.setHeader(
        "X-Is-Authenticated",
        req.session?.isAuthenticated || "false"
      );
    }

    next();
  },
};

module.exports = authMiddleware;
